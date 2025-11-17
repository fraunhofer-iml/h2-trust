/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity, } from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto, SectionDto } from '@h2-trust/api';
import { HydrogenColor, ProofOfOrigin } from '@h2-trust/domain';
import { assembleEmissionDto } from '../assembler/emission.assembler';
import { EmissionCalculatorService } from '../../emission/emission-calculator.service';
import { BatchAssembler } from '../assembler/batch.assembler';
import { ClassificationAssembler } from '../assembler/classification.assembler';

@Injectable()
export class HydrogenStorageSectionService {
  constructor(private readonly emissionCalculatorService: EmissionCalculatorService,) { }

  async buildHydrogenStorageSection(hydrogenProductionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    if (!hydrogenProductionProcessSteps || hydrogenProductionProcessSteps.length === 0) {
      return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME, [], []);
    }

    const classifications: ClassificationDto[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const processStepsByCurrentHydrogenColor = hydrogenProductionProcessSteps.filter(
        (processStep) => processStep.batch?.qualityDetails?.color === hydrogenColor,
      );

      if (processStepsByCurrentHydrogenColor.length === 0) {
        continue;
      }

      const batchesForCurrentColor: BatchDto[] = [];

      for (const processStep of processStepsByCurrentHydrogenColor) {
        const emissionCalculation: EmissionCalculationDto = await this.emissionCalculatorService.computeForProcessStep(processStep.id, 'hydrogenProduction');

        const emission = assembleEmissionDto(emissionCalculation, processStep.batch.amount);
        const batch: BatchDto = BatchAssembler.assembleHydrogenStorageBatchDto(processStep, emission);
        batchesForCurrentColor.push(batch);
      }

      const classification: ClassificationDto = ClassificationAssembler.assembleHydrogenClassification(
        hydrogenColor,
        batchesForCurrentColor,
      );
      classifications.push(classification);
    }

    return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME, [], classifications);
  }
}
