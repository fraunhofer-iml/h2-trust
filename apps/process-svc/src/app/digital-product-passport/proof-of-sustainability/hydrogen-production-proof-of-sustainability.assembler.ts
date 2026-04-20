/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEmissionEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts';
import { CalculationTopic, EmissionStringConstants, HydrogenColor, MeasurementUnit } from '@h2-trust/domain';
import { computeHydrogenStorageEmissionCalculations } from './hydrogen-storage-proof-of-sustainability.calculator';
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';

export function assembleHydrogenProductionEmissions(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance || !provenance.getAllHydrogenLeafProductions()) {
    return [];
  }

  const hydrogenAmount = provenance.hydrogenBottling
    ? provenance.hydrogenBottling.batch.amount
    : provenance.root.batch.amount;

  const hydrogenStorageEmissionCalculations = provenance
    .getAllHydrogenLeafProductions()
    .flatMap((hydrogenProduction) => computeHydrogenStorageEmissionCalculations(hydrogenProduction));

  const totalEmissions = hydrogenStorageEmissionCalculations.reduce((sum, curr) => sum + curr.result, 0);

  const totalEmissionsGrouped = Array.from(
    provenance
      .getAllHydrogenLeafProductions()
      .reduce((map, entity, index) => {
        const color = entity.batch.qualityDetails?.color ?? HydrogenColor.MIX;
        return map.set(color, (map.get(color) ?? 0) + hydrogenStorageEmissionCalculations[index].result);
      }, new Map<string, number>())
      .entries(),
  ).map(([color, result]) => `${color}: ${result} ${MeasurementUnit.G_CO2}`);

  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_STORAGE,
    ),
  ];
}

export function calculateHydrogenStorageEmission(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const hydrogenStorageEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.HYDROGEN_STORAGE)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const hydrogenStorageEmission = new ProofOfSustainabilityEmissionEntity(
    hydrogenStorageEmissionAmount,
    EmissionStringConstants.TYPES.EHS,
    EmissionStringConstants.HYDROGEN_STORAGE,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [hydrogenStorageEmission];
}

export const hydrogenProductionProofOfSustainabilityAssembler: ProofOfSustainabilityAssembler = {
  assembleEmissions: assembleHydrogenProductionEmissions,
  calculateEmission: calculateHydrogenStorageEmission,
};
