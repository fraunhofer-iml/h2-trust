/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { EmissionDto, HydrogenBatchDto, PowerBatchDto, WaterBatchDto, WaterDetailsDto } from '@h2-trust/api';
import { EnergySource, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';

export class BatchAssembler {
  static assemblePowerSupplyBatchDto(
    powerProduction: ProcessStepEntity,
    energySource: string,
    emission?: EmissionDto,
  ): PowerBatchDto {
    return new PowerBatchDto(
      powerProduction.batch.id,
      emission,
      powerProduction.startedAt,
      powerProduction.batch.amount,
      MeasurementUnit.POWER,
      null, // TBA
      powerProduction.batch.owner.name,
      powerProduction.executedBy.id,
      energySource as EnergySource,
      powerProduction.endedAt,
    );
  }

  static assembleWaterSupplyBatchDto(
    waterConsumption: ProcessStepEntity,
    emission?: EmissionDto
  ): WaterBatchDto {
    return new WaterBatchDto(
      waterConsumption.batch.id,
      emission,
      waterConsumption.startedAt,
      waterConsumption.batch.amount,
      MeasurementUnit.WATER,
      new WaterDetailsDto(0, new EmissionDto(undefined, undefined, undefined)),
    );
  }

  static assembleHydrogenStorageBatchDto(
    hydrogenStorage: ProcessStepEntity,
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      hydrogenStorage.batch.id,
      emission,
      hydrogenStorage.startedAt,
      hydrogenStorage.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      hydrogenStorage.batch.owner.name,
      hydrogenStorage.executedBy.id,
      null, //TBA
      ProofOfOrigin.HYDROGEN_PRODUCTION_TYPE,
      [
        {
          color: hydrogenStorage.batch?.qualityDetails?.color,
          amount: hydrogenStorage.batch.amount,
        },
      ],
      hydrogenStorage.batch?.qualityDetails?.color,
      null, // TBA
      hydrogenStorage.type,
      hydrogenStorage.endedAt,
    );
  }

  static assembleHydrogenBottlingBatchDto(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      hydrogenBottling.batch.id,
      emission,
      hydrogenBottling.startedAt,
      hydrogenBottling.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      null,
      hydrogenBottling.executedBy.id,
      null, // TBA
      null,
      hydrogenComposition,
      hydrogenBottling.batch?.qualityDetails?.color,
      null, // TBA
      hydrogenBottling.type,
      hydrogenBottling.endedAt,
    );
  }

  static assembleHydrogenTransportationBatchDto(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      hydrogenTransportation.batch.id,
      emission,
      hydrogenTransportation.startedAt,
      hydrogenTransportation.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      null,
      hydrogenTransportation.executedBy.id,
      null, // TBA
      null,
      hydrogenComposition,
      hydrogenTransportation.batch?.qualityDetails?.color,
      null, // TBA
      hydrogenTransportation.type,
      hydrogenTransportation.endedAt,
    );
  }
}
