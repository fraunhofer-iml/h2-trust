/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  ProcessStepEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginSectionEntity,
  ProofOfOriginSubClassificationEntity
} from '@h2-trust/amqp';
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
    hydrogenAmount: number,
  ): Promise<ProofOfOriginSectionEntity> {
    const classifications: ProofOfOriginClassificationEntity[] = [];

    if (powerProductions?.length) {
      const energySourceSubClassifications: ProofOfOriginSubClassificationEntity[] =
        await this.powerSupplyClassificationService.buildPowerSupplySubClassifications(powerProductions, hydrogenAmount);

      const powerSupplyClassification: ProofOfOriginClassificationEntity = ClassificationAssembler.assemblePower(
        ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION,
        [],
        energySourceSubClassifications,
      );

      classifications.push(powerSupplyClassification);
    }

    if (waterConsumptions?.length) {
      const waterSupplyClassification: ProofOfOriginClassificationEntity =
        this.waterSupplyClassificationService.buildWaterSupplyClassification(waterConsumptions, hydrogenAmount);

      classifications.push(waterSupplyClassification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION, [], classifications);
  }
}
