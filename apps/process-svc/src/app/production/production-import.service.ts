/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  ParsedFileBundles,
  ParsedProductionEntity,
  ParsedProductionMatchingResultEntity,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  ProcessStepEntity,
  StagedProductionEntity,
  SubmitProductionProps,
} from '@h2-trust/amqp';
import { StagedProductionRepository } from '@h2-trust/database';
import { PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
import { AccountingPeriodMatchingService } from './accounting-period-matching.service';
import { ProductionService } from './production.service';

@Injectable()
export class ProductionImportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly accountingPeriodMatchingService: AccountingPeriodMatchingService,
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly productionService: ProductionService,
  ) { }

  private static readonly CHUNK_SIZE = 10;
  private readonly logger = new Logger(ProductionImportService.name);

  async stageProductions(data: ParsedFileBundles, userId: string) {
    const gridUnitId = await this.fetchGridUnitId(userId);
    const parsedProductions: ParsedProductionEntity[] = this.accountingPeriodMatchingService.matchAccountingPeriods(
      data,
      gridUnitId,
    );

    const importId = await this.stagedProductionRepository.stageParsedProductions(parsedProductions);
    return new ParsedProductionMatchingResultEntity(importId, parsedProductions);
  }

  async finalizeStagedProductions(props: SubmitProductionProps): Promise<ProcessStepEntity[]> {
    const stagedProductions: StagedProductionEntity[] =
      await this.stagedProductionRepository.getStagedProductionsByImportId(props.importId);

    const createProductions: CreateProductionEntity[] = stagedProductions.map((stagedProduction) => {
      const startedAt: Date = new Date(stagedProduction.startedAt);
      const endedAt: Date = new Date(new Date(stagedProduction.startedAt).setMinutes(59, 59, 999));

      return new CreateProductionEntity(
        startedAt.toISOString(),
        endedAt.toISOString(),
        stagedProduction.powerProductionUnitId,
        stagedProduction.powerAmount,
        stagedProduction.hydrogenProductionUnitId,
        stagedProduction.hydrogenAmount,
        props.recordedBy,
        stagedProduction.hydrogenColor,
        props.hydrogenStorageUnitId,
        stagedProduction.powerProductionUnitOwnerId,
        stagedProduction.hydrogenProductionUnitOwnerId,
        stagedProduction.waterConsumptionLitersPerHour,
      );
    });

    this.logger.debug(`Finalizing ${createProductions.length} staged productions in chunks of ${ProductionImportService.CHUNK_SIZE}`);

    const processSteps: ProcessStepEntity[] = [];

    for (let i = 0; i < createProductions.length; i += ProductionImportService.CHUNK_SIZE) {
      this.logger.debug(`Processing ${i + 1} to ${Math.min(i + ProductionImportService.CHUNK_SIZE, createProductions.length)}`);

      const createProductionChunk = createProductions.slice(i, i + ProductionImportService.CHUNK_SIZE);

      const [powerProductions, waterConsumptions] = await Promise.all([
        Promise.all(createProductionChunk.map((production) => this.productionService.createPowerProductions(production))),
        Promise.all(createProductionChunk.map((production) => this.productionService.createWaterConsumptions(production))),
      ]);

      const hydrogenProductions = await Promise.all(
        createProductionChunk.map((production, index) =>
          this.productionService.createHydrogenProductions(production, powerProductions[index], waterConsumptions[index]),
        ),
      );

      processSteps.push(...powerProductions.flat(), ...waterConsumptions.flat(), ...hydrogenProductions.flat());
    }

    return processSteps;
  }

  private async fetchGridUnitId(userId: string): Promise<string> {
    const approvals: PowerAccessApprovalEntity[] = await firstValueFrom(
      this.generalService.send(PowerAccessApprovalPatterns.READ, {
        userId: userId,
        powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
      }),
    );
    const powerAccessApprovalForGrid = approvals.find(
      (approval) => approval.powerProductionUnit.type.name === PowerProductionType.GRID,
    );

    if (!powerAccessApprovalForGrid)
      throw new BrokerException(
        `No grid connection found for user with id ${userId}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return powerAccessApprovalForGrid.powerProductionUnit.id;
  }
}
