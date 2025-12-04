/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  ParsedFileBundles,
  ParsedProductionEntity,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  ProcessStepEntity,
  StagedProductionEntity,
  ParsedProductionMatchingResultEntity,
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
    const stagedProductions: StagedProductionEntity[] = await this.stagedProductionRepository.getStagedProductionsByImportId(props.importId);

    return await Promise.all(
      stagedProductions.map(async (stagedProduction) => {
        const startedAt: Date = new Date(stagedProduction.startedAt);
        const endedAt: Date = new Date(new Date(stagedProduction.startedAt).setMinutes(59, 59, 999));

        const entity = new CreateProductionEntity(
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
        );

        return this.productionService.createProduction(entity);
      }),
    ).then((processSteps) => processSteps.flat());
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
