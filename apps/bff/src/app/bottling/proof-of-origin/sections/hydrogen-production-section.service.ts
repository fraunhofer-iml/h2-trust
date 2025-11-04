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
import { EnergySourceClassificationService } from '../classifications/energy-source-classification.service';
import { ProofOfOriginDtoAssembler } from '../proof-of-origin-dto.assembler';

@Injectable()
export class HydrogenProductionSectionService {
  constructor(private readonly energySourceClassificationService: EnergySourceClassificationService) {}

  async buildHydrogenProductionSection(powerProductionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    const energySourceClassificationDtos: ClassificationDto[] =
      await this.energySourceClassificationService.buildEnergySourceClassificationsFromContext(
        powerProductionProcessSteps,
      );
    const powerSupplyClassification: ClassificationDto = ProofOfOriginDtoAssembler.assemblePowerClassification(
      ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION_NAME,
      [],
      energySourceClassificationDtos,
    );
    return new SectionDto(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME, [], [powerSupplyClassification]);
  }
}
