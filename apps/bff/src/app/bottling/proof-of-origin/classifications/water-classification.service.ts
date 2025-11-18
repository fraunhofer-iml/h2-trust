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
import { assembleEmissionDto } from '../assembler/emission.assembler';
import { EmissionCalculatorService } from '../../emission/emission-calculator.service';
import { ClassificationAssembler } from '../assembler/classification.assembler';
import { BatchAssembler } from '../assembler/batch.assembler';

@Injectable()
export class WaterClassificationService {
  constructor(private readonly emissionCalculatorService: EmissionCalculatorService,
  ) { }

  createWaterSupplyClassification(waterSupplies: ProcessStepEntity[]): ClassificationDto {
    if (!waterSupplies?.length) {
      const message = 'No process steps of type water supply found.';
      throw new Error(message);
    }

    const waterBatches: WaterBatchDto[] = waterSupplies.map(waterSupply => {
      const emissionCalculation: EmissionCalculationDto = this.emissionCalculatorService.computeWaterCalculation(waterSupply);
      const hydrogenKgEquivalentToWaterBatch: number = waterSupply.batch.successors[0].amount;
      const emission: EmissionDto = assembleEmissionDto(emissionCalculation, hydrogenKgEquivalentToWaterBatch);
      const batch: WaterBatchDto = BatchAssembler.assembleWaterBatchDto(waterSupply, emission);
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
