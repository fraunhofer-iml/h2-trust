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
  CreateProductionEntity,
  HydrogenStatisticsEntity,
  PowerStatisticsEntity,
  ProcessStepEntity,
  ProductionStatisticsEntity,
  UnitEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateProductionsPayload,
  ReadByIdPayload,
  ReadByIdsPayload,
} from '@h2-trust/contracts/payloads';
import { BatchType, PowerProductionType, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { QUEUE_GENERAL_SVC, UnitMessagePatterns } from '@h2-trust/messaging';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionCreationService } from './production-creation.service';
import { splitGridPowerProduction } from './utils/production.utils';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly productionCreationService: ProductionCreationService,
    private readonly processStepService: ProcessStepService,
  ) {}

  private async getProductionUnits(createProductions: CreateProductionEntity[]): Promise<Map<string, UnitEntity>> {
    const productionUnitIds: string[] = createProductions.flatMap((production) => [
      production.hydrogenStorageUnitId,
      production.powerProductionUnitId,
      production.hydrogenProductionUnitId,
    ]);
    const productionUnits: UnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_MANY_BY_IDS, new ReadByIdsPayload(productionUnitIds)),
    );
    return new Map<string, UnitEntity>(productionUnits.map((productionUnit) => [productionUnit.id, productionUnit]));
  }

  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    const powerProductionUnit: UnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(payload.powerProductionUnitId)),
    );

    const hydrogenProductionUnit: UnitEntity = await firstValueFrom(
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
      payload.hydrogenStorageUnitId,
      powerProductionUnit.owner.id,
      hydrogenProductionUnit.owner.id,
      hydrogenProductionUnit.specification.waterConsumptionLitersPerHour,
    );

    const createProductionEntities: CreateProductionEntity[] = splitGridPowerProduction(
      createProductionEntity,
      powerProductionUnit.specification.type as PowerProductionType,
    );

    const productionUnitForId: Map<string, UnitEntity> = await this.getProductionUnits(createProductionEntities);
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
      throw new InternalException(
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
            throw new InternalException(`Rfnbotype of ${processStep.id} not defined`);
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
