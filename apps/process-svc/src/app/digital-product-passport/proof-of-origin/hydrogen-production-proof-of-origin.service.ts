/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginSectionEntity,
  ProofOfOriginSubClassificationEntity,
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { Util } from '../util';
import { PowerProductionProofOfOriginService } from './power-production-proof-of-origin.service';
import { WaterConsumptionProofOfOriginService } from './water-consumption-proof-of-origin.service';

export class HydrogenProductionProofOfOriginService {
  public static buildHydrogenProductionSection(
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
    bottledKgHydrogen: number,
  ): ProofOfOriginSectionEntity {
    const classifications: ProofOfOriginClassificationEntity[] = [];

    if (powerProductions?.length) {
      const energySourceSubClassifications: ProofOfOriginSubClassificationEntity[] =
        PowerProductionProofOfOriginService.buildPowerSupplySubClassifications(powerProductions, bottledKgHydrogen);

      const powerSupplyClassification: ProofOfOriginClassificationEntity = Util.assembleClassification(
        ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION,
        BatchType.POWER,
        [],
        energySourceSubClassifications,
      );

      classifications.push(powerSupplyClassification);
    }

    if (waterConsumptions?.length) {
      const waterSupplyClassification: ProofOfOriginClassificationEntity =
        WaterConsumptionProofOfOriginService.assembleWaterSupplyClassification(waterConsumptions, bottledKgHydrogen);

      classifications.push(waterSupplyClassification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION, [], classifications);
  }
}
