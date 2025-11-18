/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity, } from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto, EmissionDto, HydrogenBatchDto, SectionDto } from '@h2-trust/api';
import { HydrogenColor, ProofOfOrigin } from '@h2-trust/domain';
import { assembleEmissionDto } from '../assembler/emission.assembler';
import { EmissionCalculatorService } from '../../emission/emission-calculator.service';
import { BatchAssembler } from '../assembler/batch.assembler';
import { ClassificationAssembler } from '../assembler/classification.assembler';

@Injectable()
export class HydrogenStorageSectionService {
  constructor(private readonly emissionCalculatorService: EmissionCalculatorService) { }

  async buildSection(hydrogenProductions: ProcessStepEntity[]): Promise<SectionDto> {
    if (!hydrogenProductions?.length) {
      return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], []);
    }

    const classifications: ClassificationDto[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const hydrogenProductionsByHydrogenColor = hydrogenProductions.filter(
        hydrogenProduction => hydrogenProduction.batch?.qualityDetails?.color === hydrogenColor,
      );

      if (hydrogenProductionsByHydrogenColor.length === 0) {
        continue;
      }

      const batchesForHydrogenColor: BatchDto[] = await Promise.all(
        hydrogenProductionsByHydrogenColor.map(async hydrogenProduction => {
          const emissionCalculation: EmissionCalculationDto = await this.emissionCalculatorService.computeForProcessStep(hydrogenProduction.id, 'storage');
          const hydrogenKgEquivalent: number = hydrogenProduction.batch.amount;
          const emission: EmissionDto = assembleEmissionDto(emissionCalculation, hydrogenKgEquivalent);
          const batch: HydrogenBatchDto = BatchAssembler.assembleHydrogenStorageBatchDto(hydrogenProduction, emission);
          return batch;
        }));

      const classification: ClassificationDto = ClassificationAssembler.assembleHydrogenClassification(hydrogenColor, batchesForHydrogenColor);
      classifications.push(classification);
    }

    return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], classifications);
  }
}
