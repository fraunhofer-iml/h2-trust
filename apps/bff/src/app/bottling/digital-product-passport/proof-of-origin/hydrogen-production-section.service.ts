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
import { ClassificationAssembler } from './classification.assembler';
import { PowerSupplyClassificationService } from './power-supply-classification.service';
import { WaterSupplyClassificationService } from './water-supply-classification.service';

@Injectable()
export class HydrogenProductionSectionService {
  constructor(
    private readonly powerSupplyClassificationService: PowerSupplyClassificationService,
    private readonly waterSupplyClassificationService: WaterSupplyClassificationService,
  ) { }

  async buildSection(
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
  ): Promise<SectionDto> {
    const classifications: ClassificationDto[] = [];

    if (powerProductions?.length) {
      const energySourceClassifications: ClassificationDto[] = await this.powerSupplyClassificationService.createPowerSupplyClassifications(powerProductions);
      const powerSupplyClassification: ClassificationDto = ClassificationAssembler.assemblePowerClassification(
        ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION,
        [],
        energySourceClassifications,
      );
      classifications.push(powerSupplyClassification);
    }

    if (waterConsumptions?.length) {
      const waterSupplyClassification: ClassificationDto =
        this.waterSupplyClassificationService.createWaterSupplyClassification(waterConsumptions);
      classifications.push(waterSupplyClassification);
    }

    return new SectionDto(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION, [], classifications);
  }
}
