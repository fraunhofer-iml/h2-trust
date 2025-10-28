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
import { ProofOfOrigin } from '@h2-trust/domain';
import { ProofOfOriginDtoAssembler } from '../assembler/proof-of-origin-dto.assembler';
import { EnergySourceClassificationService } from '../classification/energy-source-classification.service';

@Injectable()
export class InputMediaSectionService {
  constructor(private readonly energySourceClassificationService: EnergySourceClassificationService) {}

  async buildInputMediaSection(
    powerProductionProcessSteps: ProcessStepEntity[],
    batchAmount: number,
  ): Promise<SectionDto> {
    const energySourceClassificationDtos: ClassificationDto[] =
      await this.energySourceClassificationService.buildEnergySourceClassificationsFromContext(
        powerProductionProcessSteps,
        batchAmount,
      );
    const powerSupplyClassification: ClassificationDto = ProofOfOriginDtoAssembler.assemblePowerClassification(
      ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION_NAME,
      [],
      energySourceClassificationDtos,
    );
    return new SectionDto(ProofOfOrigin.INPUT_MEDIA_SECTION_NAME, [], [powerSupplyClassification]);
  }
}
