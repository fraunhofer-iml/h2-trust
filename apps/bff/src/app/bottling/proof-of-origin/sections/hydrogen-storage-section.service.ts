/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProcessStepEntity, SustainabilityMessagePatterns } from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, EmissionCalculationDto, parseColor, SectionDto } from '@h2-trust/api';
import { HydrogenColor, ProofOfOrigin } from '@h2-trust/domain';
import { toEmissionDto } from '../emission-dto.builder';
import { ProofOfOriginDtoAssembler } from '../proof-of-origin-dto.assembler';

@Injectable()
export class HydrogenStorageSectionService {
  constructor(@Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processClient: ClientProxy) {}

  async buildHydrogenStorageSection(hydrogenProductionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    if (!hydrogenProductionProcessSteps || hydrogenProductionProcessSteps.length === 0) {
      return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME, [], []);
    }

    const classifications: ClassificationDto[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const processStepsByCurrentHydrogenColor = hydrogenProductionProcessSteps.filter(
        (processStep) => parseColor(processStep.batch.quality) === hydrogenColor,
      );

      if (processStepsByCurrentHydrogenColor.length === 0) {
        continue;
      }

      const batchesForCurrentColor: BatchDto[] = [];

      for (const processStep of processStepsByCurrentHydrogenColor) {
        const emissionCalculation: EmissionCalculationDto = await firstValueFrom(
          this.processClient.send(SustainabilityMessagePatterns.COMPUTE_CUMULATIVE_FOR_STEP, {
            processStepId: processStep.id,
            emissionCalculationName: 'hydrogenProduction',
          }),
        );
        const emission = toEmissionDto(emissionCalculation, processStep.batch.amount);
        const batch: BatchDto = ProofOfOriginDtoAssembler.assembleStorageHydrogenBatchDto(processStep, emission);
        batchesForCurrentColor.push(batch);
      }

      const classification: ClassificationDto = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
        hydrogenColor,
        batchesForCurrentColor,
      );
      classifications.push(classification);
    }

    return new SectionDto(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME, [], classifications);
  }
}
