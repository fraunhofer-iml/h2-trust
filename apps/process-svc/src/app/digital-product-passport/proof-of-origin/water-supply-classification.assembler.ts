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
import { EmissionAssembler } from './emission.assembler';

export class WaterSupplyClassificationAssembler {
  static assembleClassification(
    waterSupplies: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginClassificationEntity {
    if (!waterSupplies?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: ProofOfOriginWaterBatchEntity[] = waterSupplies.map((waterSupply) => {
      const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
        EmissionAssembler.assembleWaterSupply(waterSupply);

      const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
        bottledKgHydrogen,
        emissionCalculation.result,
      );

      const batch: ProofOfOriginWaterBatchEntity = this.assembleWaterSupply(waterSupply, emission);

      return batch;
    });

    return ProofOfOriginClassificationEntity.assemble(
      ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      BatchType.WATER,
      waterBatches,
      [],
    );
  }

  static assembleWaterSupply(
    waterConsumption: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginWaterBatchEntity {
    return {
      id: waterConsumption.batch.id,
      emission,
      createdAt: waterConsumption.startedAt,
      amount: waterConsumption.batch.amount,
      batchType: BatchType.WATER,
      deionizedWaterAmount: waterConsumption.batch.amount,
      deionizedWaterEmission: { totalEmissions: 0, totalEmissionsPerKgHydrogen: 0, basisOfCalculation: [] },
    };
  }
}
