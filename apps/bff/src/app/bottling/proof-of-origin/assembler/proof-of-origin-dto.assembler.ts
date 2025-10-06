/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, ProcessStepEntity, Util } from '@h2-trust/amqp';
import {
  BatchDto,
  BatchType,
  ClassificationDto,
  ClassificationType,
  EmissionDto,
  EnergySource,
  HydrogenBatchDto,
  MeasurementUnit,
  parseColor,
  PowerBatchDto,
} from '@h2-trust/api';
import { ProofOfOriginConstants } from '../proof-of-origin.constants';

export class ProofOfOriginDtoAssembler {
  static assembleProductionPowerBatchDto(processStepEntity: ProcessStepEntity, energySource: string): BatchDto {
    return new PowerBatchDto(
      processStepEntity.batch.id,
      ProofOfOriginDtoAssembler.assembleEmissionDto(),
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

  static assembleProductionHydrogenBatchDto(processStepEntity: ProcessStepEntity): BatchDto {
    return new HydrogenBatchDto(
      processStepEntity.batch.id,
      ProofOfOriginDtoAssembler.assembleEmissionDto(),
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      processStepEntity.batch.owner.name,
      processStepEntity.executedBy.id,
      null, //TBA
      ProofOfOriginConstants.HYDROGEN_PRODUCTION_TYPE,
      [
        {
          color: parseColor(processStepEntity.batch.quality),
          amount: processStepEntity.batch.amount,
        },
      ],
      parseColor(processStepEntity.batch.quality),
      null, // TBA
      processStepEntity.processType,
      processStepEntity.endedAt,
    );
  }

  static assembleBottlingHydrogenBatchDto(
    processStepEntity: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
  ): BatchDto {
    return new HydrogenBatchDto(
      processStepEntity.batch.id,
      ProofOfOriginDtoAssembler.assembleEmissionDto(),
      processStepEntity.startedAt,
      processStepEntity.batch.amount,
      MeasurementUnit.HYDROGEN,
      null, // TBA
      null,
      processStepEntity.executedBy.id,
      null, // TBA
      null,
      hydrogenComposition,
      parseColor(processStepEntity.batch.quality),
      null, // TBA
      processStepEntity.processType,
      processStepEntity.endedAt,
    );
  }

  private static assembleEmissionDto() {
    return new EmissionDto(
      0, // TBA
      0, // TBA
      'TBD', // TBA
    );
  }

  static assemblePowerClassification(
    classificationName: string,
    batchDtos?: BatchDto[],
    nestedClassificationDtos?: ClassificationDto[],
  ): ClassificationDto {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.POWER,
      BatchType.POWER,
      batchDtos,
      nestedClassificationDtos,
    );
  }

  static assembleHydrogenClassification(
    classificationName: string,
    batchDtos?: BatchDto[],
    nestedClassificationDtos?: ClassificationDto[],
  ): ClassificationDto {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.HYDROGEN,
      BatchType.HYDROGEN,
      batchDtos,
      nestedClassificationDtos,
    );
  }

  static assembleClassification(
    classificationName: string,
    measurementUnit: MeasurementUnit,
    classificationType: ClassificationType,
    batchDtos: BatchDto[] = [],
    nestedClassificationDtos: ClassificationDto[] = [],
  ): ClassificationDto {
    return new ClassificationDto(
      classificationName,
      null, // TBA
      this.calculateClassificationAmount(batchDtos, nestedClassificationDtos),
      null, // TBA
      batchDtos,
      nestedClassificationDtos,
      measurementUnit,
      classificationType,
    );
  }

  private static calculateClassificationAmount(batchDtos: BatchDto[], nestedClassificationDtos: ClassificationDto[]) {
    return Util.sumAmounts(batchDtos) || Util.sumAmounts(nestedClassificationDtos);
  }
}
