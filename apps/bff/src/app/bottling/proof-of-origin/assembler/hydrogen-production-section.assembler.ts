/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, HydrogenColor, parseColor, ProcessType, SectionDto } from '@h2-trust/api';
import { ProofOfOriginConstants } from '../proof-of-origin.constants';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';

export class HydrogenProductionSectionAssembler {
  static buildHydrogenProductionSection(hydrogenProductionProcessSteps: ProcessStepEntity[]): SectionDto {
    const nonHydrogenProductionProcessSteps = hydrogenProductionProcessSteps.filter(
      (processStep) => processStep.processType !== ProcessType.HYDROGEN_PRODUCTION,
    );

    if (nonHydrogenProductionProcessSteps.length > 0) {
      throw new HttpException(
        `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}]`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const productionClassifications: ClassificationDto[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const processStepsByHydrogenColor = hydrogenProductionProcessSteps.filter(
        (processStep) => parseColor(processStep.batch.quality) === hydrogenColor,
      );

      if (processStepsByHydrogenColor.length > 0) {
        const batchesForAColor = processStepsByHydrogenColor.map(
          ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto,
        );

        const productionClassification = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
          hydrogenColor,
          batchesForAColor,
        );

        productionClassifications.push(productionClassification);
      }
    }

    return new SectionDto(ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME, [], productionClassifications);
  }
}
