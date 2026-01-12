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
  ProofOfOriginWaterDetailsEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, MeasurementUnit } from '@h2-trust/domain';

export class BatchAssembler {
  static assemblePowerSupply(
    powerProduction: ProcessStepEntity,
    energySource: string,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginPowerBatchEntity {
    return new ProofOfOriginPowerBatchEntity(
      powerProduction.batch.id,
      emission,
      powerProduction.startedAt,
      powerProduction.batch.amount,
      MeasurementUnit.POWER,
      powerProduction.batch.owner.name,
      powerProduction.executedBy.id,
      energySource as EnergySource,
      powerProduction.endedAt,
      BatchType.POWER,
    );
  }

  static assembleWaterSupply(
    waterConsumption: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginWaterBatchEntity {
    return new ProofOfOriginWaterBatchEntity(
      waterConsumption.batch.id,
      emission,
      waterConsumption.startedAt,
      waterConsumption.batch.amount,
      MeasurementUnit.WATER,
      new ProofOfOriginWaterDetailsEntity(
        waterConsumption.batch.amount,
        new ProofOfOriginEmissionEntity(undefined, undefined, undefined),
      ),
      BatchType.WATER,
    );
  }

  static assembleHydrogenStorage(
    hydrogenStorage: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return new ProofOfOriginHydrogenBatchEntity(
      hydrogenStorage.batch.id,
      emission,
      hydrogenStorage.startedAt,
      hydrogenStorage.batch.amount,
      MeasurementUnit.HYDROGEN,
      [
        {
          color: hydrogenStorage.batch?.qualityDetails?.color,
          amount: hydrogenStorage.batch.amount,
        },
      ],
      BatchType.HYDROGEN,
      hydrogenStorage.batch.owner?.name,
      hydrogenStorage.executedBy.id,
      undefined,
      undefined,
      hydrogenStorage.batch?.qualityDetails?.color,
      undefined,
      hydrogenStorage.type,
      hydrogenStorage.endedAt,
    );
  }

  static assembleHydrogenBottling(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return new ProofOfOriginHydrogenBatchEntity(
      hydrogenBottling.batch.id,
      emission,
      hydrogenBottling.startedAt,
      hydrogenBottling.batch.amount,
      MeasurementUnit.HYDROGEN,
      hydrogenComposition,
      BatchType.HYDROGEN,
      undefined,
      hydrogenBottling.executedBy.id,
      undefined,
      undefined,
      hydrogenBottling.batch?.qualityDetails?.color,
      undefined,
      hydrogenBottling.type,
      hydrogenBottling.endedAt,
    );
  }

  static assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return new ProofOfOriginHydrogenBatchEntity(
      hydrogenTransportation.batch.id,
      emission,
      hydrogenTransportation.startedAt,
      hydrogenTransportation.batch.amount,
      MeasurementUnit.HYDROGEN,
      hydrogenComposition,
      BatchType.HYDROGEN,
      undefined,
      hydrogenTransportation.executedBy.id,
      undefined,
      undefined,
      hydrogenTransportation.batch?.qualityDetails?.color,
      undefined,
      hydrogenTransportation.type,
      hydrogenTransportation.endedAt,
    );
  }
}
