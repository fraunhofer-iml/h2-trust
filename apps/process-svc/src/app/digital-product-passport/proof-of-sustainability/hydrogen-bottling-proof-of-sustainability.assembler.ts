/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEmissionEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { CalculationTopic, EmissionStringConstants, MeasurementUnit, ProcessType } from '@h2-trust/domain';
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';

export function assembleHydrogenBottlingEmissionCalculation(
  hydrogenBottling: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
    throw new Error(`Invalid process step type [${hydrogenBottling?.type}] for hydrogen bottling emission calculation`);
  }

  const result = 0;
  const basisOfCalculation = ['E = [TBD]'];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.HYDROGEN_BOTTLING,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_BOTTLING,
  );
}

export function assembleHydrogenBottlingEmissions(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance || !provenance.hydrogenBottling) {
    return [];
  }

  const hydrogenAmount = provenance.hydrogenBottling
    ? provenance.hydrogenBottling.batch.amount
    : provenance.root.batch.amount;
  const hydrogenBottling = assembleHydrogenBottlingEmissionCalculation(provenance.hydrogenBottling);

  const totalEmissions = hydrogenBottling.result;
  const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_BOTTLING,
    ),
  ];
}

export function calculateHydrogenBottlingEmission(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const hydrogenBottlingEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.HYDROGEN_BOTTLING)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const hydrogenBottlingEmission = new ProofOfSustainabilityEmissionEntity(
    hydrogenBottlingEmissionAmount,
    EmissionStringConstants.TYPES.EHB,
    EmissionStringConstants.HYDROGEN_BOTTLING,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [hydrogenBottlingEmission];
}

export const hydrogenBottlingProofOfSustainabilityAssembler: ProofOfSustainabilityAssembler = {
  assembleEmissions: assembleHydrogenBottlingEmissions,
  calculateEmission: calculateHydrogenBottlingEmission,
};
