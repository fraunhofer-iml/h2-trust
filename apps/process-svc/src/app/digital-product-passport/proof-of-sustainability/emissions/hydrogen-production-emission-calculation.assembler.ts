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
} from '@h2-trust/contracts/entities';
import { CalculationTopic, EmissionStringConstants, MeasurementUnit } from '@h2-trust/domain';
import { ProofOfSustainabilityEmissionAssembler } from '../proof-of-sustainability-assembler.interface';
import { assembleHydrogenStorageEmissionCalculations } from './hydrogen-storage-emission-calculation.assembler';

export function assembleHydrogenProductionEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  const hydrogenAmount = provenance.root.batch.amount;

  const hydrogenStorageEmissionCalculations = provenance
    .getAllHydrogenLeafProductions()
    .flatMap((hydrogenProduction) => assembleHydrogenStorageEmissionCalculations(hydrogenProduction));

  const totalEmissions = hydrogenStorageEmissionCalculations.reduce((sum, curr) => sum + curr.result, 0);

  const totalEmissionsGrouped = [
    `${hydrogenStorageEmissionCalculations.at(0)?.name}: ${totalEmissions} ${MeasurementUnit.G_CO2}`,
  ];

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

export function calculateHydrogenStorageEmissions(
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

export const hydrogenProductionEmissionAssembler: ProofOfSustainabilityEmissionAssembler = {
  assembleEmissionCalculations: assembleHydrogenProductionEmissionCalculations,
  calculateEmissions: calculateHydrogenStorageEmissions,
};
