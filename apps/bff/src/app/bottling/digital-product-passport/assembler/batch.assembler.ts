/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import {
  EmissionDto,
  HydrogenBatchDto,
  PowerBatchDto,
  WaterBatchDto,
  WaterDetailsDto,
} from '@h2-trust/api';
import { EnergySource, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';

export class BatchAssembler {
  static assemblePowerProductionBatchDto(
    processStepEntity: ProcessStepEntity,
    energySource: string,
    emission?: EmissionDto,
  ): PowerBatchDto {
    return new PowerBatchDto(
      processStepEntity.batch.id,
      emission,
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.POWER,
      null, // TBA
      processStepEntity.batch.owner.name,
      processStepEntity.executedBy.id,
      energySource as EnergySource,
      processStepEntity.endedAt,
    );
  }

  static assembleWaterBatchDto(processStepEntity: ProcessStepEntity, emission?: EmissionDto): WaterBatchDto {
    return new WaterBatchDto(
      processStepEntity.batch.id,
      emission,
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.WATER,
      new WaterDetailsDto(0, new EmissionDto(undefined, undefined, undefined)),
      new WaterDetailsDto(0, new EmissionDto(undefined, undefined, undefined)),
      new WaterDetailsDto(0, new EmissionDto(undefined, undefined, undefined)),
    );
  }

  static assembleHydrogenStorageBatchDto(
    processStepEntity: ProcessStepEntity,
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      processStepEntity.batch.id,
      emission,
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      processStepEntity.batch.owner.name,
      processStepEntity.executedBy.id,
      null, //TBA
      ProofOfOrigin.HYDROGEN_PRODUCTION_TYPE,
      [
        {
          color: processStepEntity.batch?.qualityDetails?.color,
          amount: processStepEntity.batch.amount,
        },
      ],
      processStepEntity.batch?.qualityDetails?.color,
      null, // TBA
      processStepEntity.type,
      processStepEntity.endedAt,
    );
  }

  static assembleHydrogenBottlingBatchDto(
    processStepEntity: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      processStepEntity.batch.id,
      emission,
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      null,
      processStepEntity.executedBy.id,
      null, // TBA
      null,
      hydrogenComposition,
      processStepEntity.batch?.qualityDetails?.color,
      null, // TBA
      processStepEntity.type,
      processStepEntity.endedAt,
    );
  }

  static assembleHydrogenTransportationBatchDto(
    processStepEntity: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: EmissionDto,
  ): HydrogenBatchDto {
    return new HydrogenBatchDto(
      processStepEntity.batch.id,
      emission,
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      null,
      processStepEntity.executedBy.id,
      null, // TBA
      null,
      hydrogenComposition,
      processStepEntity.batch?.qualityDetails?.color,
      null, // TBA
      processStepEntity.type,
      processStepEntity.endedAt,
    );
  }
}
