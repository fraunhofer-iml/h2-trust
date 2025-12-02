/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, EmissionCalculationDto, EmissionDto, WaterBatchDto } from '@h2-trust/api';
import { BatchType, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { EmissionCalculationAssembler } from '../emission.assembler';
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';

@Injectable()
export class WaterSupplyClassificationService {
  buildWaterSupplyClassification(waterSupplies: ProcessStepEntity[]): ClassificationDto {
    if (!waterSupplies?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: WaterBatchDto[] = waterSupplies.map((waterSupply) => {
      const emissionCalculation: EmissionCalculationDto =
        EmissionCalculationAssembler.assembleWaterSupplyCalculation(waterSupply);
      const hydrogenKgEquivalentToWaterBatch: number = waterSupply.batch.successors[0].amount;
      const emission: EmissionDto = EmissionCalculationAssembler.assembleEmissionDto(
        emissionCalculation,
        hydrogenKgEquivalentToWaterBatch,
      );
      const batch: WaterBatchDto = BatchAssembler.assembleWaterSupplyBatchDto(waterSupply, emission);
      return batch;
    });

    return ClassificationAssembler.assembleClassification(
      ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      MeasurementUnit.WATER,
      BatchType.WATER,
      waterBatches,
      [],
    );
  }
}
