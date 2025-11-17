/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, EmissionCalculationDto, WaterBatchDto } from '@h2-trust/api';
import { BatchType, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { assembleEmissionDto } from '../assembler/emission.assembler';
import { EmissionCalculatorService } from '../../emission/emission-calculator.service';
import { ClassificationAssembler } from '../assembler/classification.assembler';
import { BatchAssembler } from '../assembler/batch.assembler';

@Injectable()
export class WaterClassificationService {
  constructor(private readonly emissionCalculatorService: EmissionCalculatorService,
  ) { }

  async buildWaterClassification(waterConsumptionProcessSteps: ProcessStepEntity[]): Promise<ClassificationDto> {
    if (!waterConsumptionProcessSteps?.length) {
      const message = 'No water consumption process steps found';
      throw new Error(message);
    }

    const waterDtos = await this.buildWaterDtos(waterConsumptionProcessSteps);

    return ClassificationAssembler.assembleClassification(
      ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION_NAME,
      MeasurementUnit.WATER,
      BatchType.WATER,
      waterDtos,
      [],
    );
  }

  private async buildWaterDtos(waterConsumptionProcessSteps: ProcessStepEntity[]): Promise<WaterBatchDto[]> {
    const waterBatchDtoPromises: Promise<WaterBatchDto>[] = waterConsumptionProcessSteps.map(
      async (waterConsumptionProcessStep) => {
        const emissionCalculation: EmissionCalculationDto = this.emissionCalculatorService.computeWaterCalculation(waterConsumptionProcessStep);

        const h2KgEquivalentToWaterBatch = waterConsumptionProcessStep.batch.successors[0].amount;
        const emission = assembleEmissionDto(emissionCalculation, h2KgEquivalentToWaterBatch);

        return BatchAssembler.assembleWaterBatchDto(waterConsumptionProcessStep, emission);
      },
    );

    return Promise.all(waterBatchDtoPromises);
  }
}
