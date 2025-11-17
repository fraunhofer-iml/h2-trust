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
import { WaterClassificationService } from '../classifications/water-classification.service';
import { ClassificationAssembler } from '../assembler/classification.assembler';

@Injectable()
export class HydrogenProductionSectionService {
  constructor(
    private readonly energySourceClassificationService: EnergySourceClassificationService,
    private readonly waterClassificationService: WaterClassificationService,
  ) {}

  async buildHydrogenProductionSection(
    powerProductionProcessSteps: ProcessStepEntity[],
    waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<SectionDto> {
    const classifications: ClassificationDto[] = [];

    if (powerProductionProcessSteps?.length) {
      const energySourceClassificationDtos: ClassificationDto[] =
        await this.energySourceClassificationService.buildEnergySourceClassifications(powerProductionProcessSteps);

      const powerSupplyClassification: ClassificationDto = ClassificationAssembler.assemblePowerClassification(
        ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION_NAME,
        [],
        energySourceClassificationDtos,
      );
      classifications.push(powerSupplyClassification);
    }

    if (waterConsumptionProcessSteps?.length) {
      classifications.push(
        await this.waterClassificationService.buildWaterClassification(waterConsumptionProcessSteps),
      );
    }

    return new SectionDto(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME, [], classifications);
  }
}
