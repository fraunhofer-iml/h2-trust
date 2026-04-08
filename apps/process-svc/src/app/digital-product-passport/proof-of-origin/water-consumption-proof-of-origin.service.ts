/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginWaterBatchEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { WaterConsumptionPosService } from '../proof-of-sustainability/water-consumption-pos.service';
import { Util } from '../util';

export class WaterConsumptionProofOfOriginService {
  public static assembleWaterSupplyClassification(
    waterConsumptionProcess: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginClassificationEntity {
    if (!waterConsumptionProcess?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: ProofOfOriginWaterBatchEntity[] = this.getWaterBatchEntities(
      waterConsumptionProcess,
      bottledKgHydrogen,
    );

    return Util.assembleClassification(ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION, BatchType.WATER, waterBatches, []);
  }

  private static getWaterBatchEntities(
    waterConsumptionProcesses: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginWaterBatchEntity[] {
    return waterConsumptionProcesses.map((waterConsumptionProcess) => {
      const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
        WaterConsumptionPosService.assembleWaterSupply(waterConsumptionProcess);

      const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
        bottledKgHydrogen,
        emissionCalculation.result,
      );

      return {
        id: waterConsumptionProcess.batch.id,
        emission,
        createdAt: waterConsumptionProcess.startedAt,
        amount: waterConsumptionProcess.batch.amount,
        batchType: BatchType.WATER,
        deionizedWaterAmount: waterConsumptionProcess.batch.amount,
        deionizedWaterEmission: new ProofOfOriginEmissionEntity(0, 0, []),
      };
    });
  }
}
