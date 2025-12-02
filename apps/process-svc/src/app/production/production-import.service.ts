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
  StagedProductionEntity,
  StagedProductionMatchingResultEntity,
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  ParsedFileBundles,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  SubmitProductionProps,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { StagedProductionRepository } from '@h2-trust/database';
import { PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
import { AccountingPeriodMatchingService } from './accounting-period-matching.service';
import { ProductionService } from './production.service';

@Injectable()
export class ProductionImportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly accountingPeriodMatcher: AccountingPeriodMatchingService,
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly productionService: ProductionService,
  ) { }

  async stageImportedProductionData(data: ParsedFileBundles, userId: string) {
    const gridUnitId = await this.fetchGridUnitId(userId);
    const stagedProductions: StagedProductionEntity[] = this.accountingPeriodMatcher.matchAccountingPeriods(
      data,
      gridUnitId,
    );

    const id = await this.stagedProductionRepository.stageProductions(stagedProductions);
    return new StagedProductionMatchingResultEntity(id, stagedProductions);
  }

  async finalizeProductionData(props: SubmitProductionProps): Promise<ProcessStepEntity[]> {
    const stagedProductions = await this.stagedProductionRepository.getStagedProductionsByImportId(props.importId);

    return await Promise.all(
      stagedProductions.map(async (accountingPeriod) => {
        const hydrogenColor = await this.fetchHydrogenColor(accountingPeriod.powerProductionUnitId);
        const companyIdOfPowerProductionUnit = await this.fetchCompanyOfProductionUnit(
          accountingPeriod.powerProductionUnitId,
        );
        const companyIdOfHydrogenProductionUnit = await this.fetchCompanyOfProductionUnit(
          accountingPeriod.hydrogenProductionUnitId,
        );

        const startedAt: Date = new Date(accountingPeriod.startedAt);
        const endedAt: Date = new Date(new Date(accountingPeriod.startedAt).setMinutes(59, 59, 999));

        const entity = new CreateProductionEntity(
          startedAt.toISOString(),
          endedAt.toISOString(),
          accountingPeriod.powerProductionUnitId,
          accountingPeriod.powerAmount,
          accountingPeriod.hydrogenProductionUnitId,
          accountingPeriod.hydrogenAmount,
          props.recordedBy,
          hydrogenColor,
          props.hydrogenStorageUnitId,
          companyIdOfPowerProductionUnit,
          companyIdOfHydrogenProductionUnit,
        );

        return this.productionService.createProduction(entity, true);
      }),
    ).then((processSteps) => processSteps.flat());
  }

  private async fetchCompanyOfProductionUnit(productionUnitId: string): Promise<string> {
    const productionUnitEntity: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: productionUnitId }),
    );

    if (!productionUnitEntity.company) {
      throw new BrokerException(
        `Production Unit ${productionUnitId} does not have an associated company`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return productionUnitEntity.company.id;
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

  private async fetchHydrogenColor(powerProductionUnitId: string): Promise<string> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionUnitId }),
    );

    const hydrogenColor = powerProductionUnit?.type?.hydrogenColor;

    if (!hydrogenColor) {
      throw new BrokerException(
        `Power Production Unit ${powerProductionUnitId} has no Hydrogen Color`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenColor;
  }
}
