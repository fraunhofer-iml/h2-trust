/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginWaterBatchEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, MeasurementUnit } from '@h2-trust/domain';

export class BatchAssembler {
  static assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: string,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginPowerBatchEntity {
    return {
      id: powerProduction.batch.id,
      emission,
      createdAt: powerProduction.startedAt,
      amount: powerProduction.batch.amount,
      unit: MeasurementUnit.POWER,
      batchType: BatchType.POWER,
      producer: powerProduction.batch.owner.name,
      unitId: powerProduction.executedBy.id,
      energySource: energySource as EnergySource,
      accountingPeriodEnd: powerProduction.endedAt,
    };
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
      unit: MeasurementUnit.WATER,
      batchType: BatchType.WATER,
      deionizedWaterAmount: waterConsumption.batch.amount,
      deionizedWaterEmission: { totalEmissions: 0, totalEmissionsPerKgHydrogen: 0, basisOfCalculation: [] },
    };
  }

  static assembleHydrogenStorage(
    hydrogenStorage: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return {
      id: hydrogenStorage.batch.id,
      emission,
      createdAt: hydrogenStorage.startedAt,
      amount: hydrogenStorage.batch.amount,
      unit: MeasurementUnit.HYDROGEN,
      batchType: BatchType.HYDROGEN,
      hydrogenComposition: [
        {
          color: hydrogenStorage.batch?.qualityDetails?.color,
          amount: hydrogenStorage.batch.amount,
        },
      ],
      producer: hydrogenStorage.batch.owner?.name,
      unitId: hydrogenStorage.executedBy.id,
      color: hydrogenStorage.batch?.qualityDetails?.color,
      processStep: hydrogenStorage.type,
      accountingPeriodEnd: hydrogenStorage.endedAt,
    };
  }

  static assembleHydrogenBottling(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return {
      id: hydrogenBottling.batch.id,
      emission,
      createdAt: hydrogenBottling.startedAt,
      amount: hydrogenBottling.batch.amount,
      unit: MeasurementUnit.HYDROGEN,
      batchType: BatchType.HYDROGEN,
      hydrogenComposition,
      unitId: hydrogenBottling.executedBy.id,
      color: hydrogenBottling.batch?.qualityDetails?.color,
      processStep: hydrogenBottling.type,
      accountingPeriodEnd: hydrogenBottling.endedAt,
    };
  }

  static assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return {
      id: hydrogenTransportation.batch.id,
      emission,
      createdAt: hydrogenTransportation.startedAt,
      amount: hydrogenTransportation.batch.amount,
      unit: MeasurementUnit.HYDROGEN,
      batchType: BatchType.HYDROGEN,
      hydrogenComposition,
      unitId: hydrogenTransportation.executedBy.id,
      color: hydrogenTransportation.batch?.qualityDetails?.color,
      processStep: hydrogenTransportation.type,
      accountingPeriodEnd: hydrogenTransportation.endedAt,
    };
  }
}
