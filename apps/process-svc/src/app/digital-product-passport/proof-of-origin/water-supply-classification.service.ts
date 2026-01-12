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
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class WaterSupplyClassificationService {
  buildWaterSupplyClassification(waterSupplies: ProcessStepEntity[], hydrogenAmount: number): ClassificationDto {
    if (!waterSupplies?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: WaterBatchDto[] = waterSupplies.map((waterSupply) => {
      const emissionCalculation: EmissionCalculationDto = EmissionAssembler.assembleWaterSupply(
        waterSupply,
        hydrogenAmount,
      );

      const emission: EmissionDto = EmissionAssembler.assembleEmissionDto(
        emissionCalculation,
        hydrogenAmount,
      );

      const batch: WaterBatchDto = BatchAssembler.assembleWaterSupply(waterSupply, emission);

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
