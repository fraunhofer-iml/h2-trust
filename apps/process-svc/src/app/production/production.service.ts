/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BatchEntity,
  ConcreteUnitEntity,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  HydrogenStatisticsEntity,
  PowerProductionUnitEntity,
  PowerStatisticsEntity,
  ProcessStepEntity,
  ProductionStatisticsEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateProductionsPayload,
  ReadByIdPayload,
  ReadByIdsPayload,
} from '@h2-trust/contracts/payloads';
import { BatchType, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { BrokerQueues, UnitMessagePatterns } from '@h2-trust/messaging';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionCreationService } from './production-creation.service';
import { ProductionUtils } from './utils/production.utils';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly productionCreationService: ProductionCreationService,
    private readonly processStepService: ProcessStepService,
  ) {}

  private async getProductionUnits(
    createProductions: CreateProductionEntity[],
  ): Promise<Map<string, ConcreteUnitEntity>> {
    const productionUnitIds: string[] = createProductions.flatMap((production) => [
      production.hydrogenStorageUnitId,
      production.powerProductionUnitId,
      production.hydrogenProductionUnitId,
    ]);
    const productionUnits: ConcreteUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_MANY_BY_IDS, new ReadByIdsPayload(productionUnitIds)),
    );
    return new Map<string, ConcreteUnitEntity>(
      productionUnits.map((productionUnit) => [productionUnit.id, productionUnit]),
    );
  }

  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(payload.powerProductionUnitId)),
    );

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(payload.hydrogenProductionUnitId)),
    );

    const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
      payload.productionStartedAt,
      payload.productionEndedAt,
      payload.powerProductionUnitId,
      PowerType.RENEWABLE,
      payload.powerAmountKwh,
      payload.hydrogenProductionUnitId,
      payload.hydrogenAmountKg,
      payload.userId,
      powerProductionUnit.type.hydrogenColor,
      payload.hydrogenStorageUnitId,
      powerProductionUnit.owner.id,
      hydrogenProductionUnit.owner.id,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
    );

    const createProductionEntities: CreateProductionEntity[] = ProductionUtils.splitGridPowerProduction(
      createProductionEntity,
      powerProductionUnit.type.energySource,
    );

    const productionUnitForId: Map<string, ConcreteUnitEntity> =
      await this.getProductionUnits(createProductionEntities);
    return this.productionCreationService.createAndPersistProductions(createProductionEntities, productionUnitForId);
  }

  async assembleProductionStatistics(
    payload: CreateHydrogenProductionStatisticsPayload,
  ): Promise<ProductionStatisticsEntity> {
    const hydrogenProcesses: ProcessStepEntity[] =
      await this.processStepService.readProcessStepsByPredecessorTypesAndUnitAndDate(
        [ProcessType.POWER_PRODUCTION],
        payload,
      );

    const invalidProcessTypes = [
      ...new Set(
        hydrogenProcesses
          .filter((processStep) => processStep.type !== ProcessType.HYDROGEN_PRODUCTION)
          .map((processStep) => processStep.type),
      ),
    ];

    if (invalidProcessTypes.length > 0) {
      throw new Error(
        `Expected only ${ProcessType.HYDROGEN_PRODUCTION} process steps, but received: ${invalidProcessTypes.join(', ')}`,
      );
    }

    const hydrogenStatistics = this.assembleHydrogenStatistics(hydrogenProcesses);

    const powerStatistics = this.assemblePowerStatistics(hydrogenProcesses);

    return new ProductionStatisticsEntity(hydrogenStatistics, powerStatistics);
  }

  private assembleHydrogenStatistics(processSteps: ProcessStepEntity[]): HydrogenStatisticsEntity {
    const {
      nonCertifiable,
      rfnboReady,
    }: {
      nonCertifiable: number;
      rfnboReady: number;
    } = processSteps.reduce(
      (statistics, processStep) => {
        const qualityDetails = processStep.batch.qualityDetails;
        if (!processStep.batch.active || !qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.rfnboType) {
          case RfnboType.RFNBO_READY:
            statistics.rfnboReady += processStep.batch.amount;
            break;
          case RfnboType.NON_CERTIFIABLE:
            statistics.nonCertifiable += processStep.batch.amount;
            break;
          default:
            throw new Error(`Rfnbotype of ${processStep.id} not defined`);
        }
        return statistics;
      },
      { nonCertifiable: 0, rfnboReady: 0 },
    );
    return new HydrogenStatisticsEntity(nonCertifiable, rfnboReady);
  }

  private assemblePowerStatistics(processSteps: ProcessStepEntity[]): PowerStatisticsEntity {
    const batches: BatchEntity[] = processSteps
      .map((ps) => (ps.batch.predecessors ?? []).filter((batch) => batch.type === BatchType.POWER))
      .flat();
    const { renewable, partlyRenewable, nonRenewable } = batches.reduce(
      (statistics, batch) => {
        const qualityDetails = batch.qualityDetails;
        if (!qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.powerType) {
          case PowerType.RENEWABLE:
            statistics.renewable += batch.amount;
            break;
          case PowerType.PARTLY_RENEWABLE:
            statistics.partlyRenewable += batch.amount;
            break;
          case PowerType.NON_RENEWABLE:
            statistics.nonRenewable += batch.amount;
            break;
        }
        return statistics;
      },
      { renewable: 0, partlyRenewable: 0, nonRenewable: 0 },
    );
    return new PowerStatisticsEntity(renewable, partlyRenewable, nonRenewable);
  }
}
