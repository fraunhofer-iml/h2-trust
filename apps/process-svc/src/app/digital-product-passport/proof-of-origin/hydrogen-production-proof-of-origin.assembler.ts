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
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { Util } from '../util';
import { buildPowerSupplySubClassifications } from './power-production-proof-of-origin.assembler';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';
import { assembleWaterSupplyClassification } from './water-consumption-proof-of-origin.assembler';

export function assembleHydrogenProductionSection(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (provenance.getAllPowerProductions()?.length == 0 && provenance.getAllWaterConsumptions()?.length == 0) {
    return [];
  }

  const powerProductions: ProcessStepEntity[] = provenance.getAllPowerProductions();
  const waterConsumptions: ProcessStepEntity[] = provenance.getAllWaterConsumptions();
  const bottledKgHydrogen: number = provenance.hydrogenBottling.batch.amount;

  const classifications: ProofOfOriginClassificationEntity[] = [];

  if (powerProductions?.length) {
    const energySourceSubClassifications: ProofOfOriginSubClassificationEntity[] = buildPowerSupplySubClassifications(
      powerProductions,
      bottledKgHydrogen,
    );

    const powerSupplyClassification: ProofOfOriginClassificationEntity = Util.assembleClassification(
      ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION,
      BatchType.POWER,
      [],
      energySourceSubClassifications,
    );

    classifications.push(powerSupplyClassification);
  }

  if (waterConsumptions?.length) {
    const waterSupplyClassification: ProofOfOriginClassificationEntity = assembleWaterSupplyClassification(
      waterConsumptions,
      bottledKgHydrogen,
    );

    classifications.push(waterSupplyClassification);
  }

  return [new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION, [], classifications)];
}

export const hydrogenProductionProofOfOriginAssembler: ProofOfOriginAssembler = {
  assembleSection: assembleHydrogenProductionSection,
};
