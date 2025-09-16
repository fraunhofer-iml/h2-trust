/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, SectionDto } from '@h2-trust/api';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

@Injectable()
export class InputMediaSectionService {
  constructor(private readonly energySourceClassificationService: EnergySourceClassificationService) {}

  async buildInputMediaSection(powerProductionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    const energySourceClassificationDtos: ClassificationDto[] =
      await this.energySourceClassificationService.buildEnergySourceClassificationsFromProcessSteps(
        powerProductionProcessSteps,
      );
    const powerSupplyClassification: ClassificationDto = ProofOfOriginDtoAssembler.assemblePowerClassification(
      ProofOfOriginConstants.POWER_SUPPLY_CLASSIFICATION_NAME,
      [],
      energySourceClassificationDtos,
    );
    return new SectionDto(ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, [], [powerSupplyClassification]);
  }
}
