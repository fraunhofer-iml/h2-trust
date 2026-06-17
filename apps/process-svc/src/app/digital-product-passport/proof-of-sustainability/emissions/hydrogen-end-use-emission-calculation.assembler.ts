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
} from '@h2-trust/contracts/entities';
import { CalculationTopic, EmissionStringConstants, MeasurementUnit, ProcessType } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { ProofOfSustainabilityEmissionAssembler } from '../proof-of-sustainability-assembler.interface';

export function assembleHydrogenEndUseEmissionCalculation(
  hydrogenEndUse: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (hydrogenEndUse?.type !== ProcessType.HYDROGEN_END_USE) {
    throw new InternalException(
      `Invalid process step type [${hydrogenEndUse?.type}] for hydrogen end use emission calculation`,
    );
  }

  const result = 0;
  const basisOfCalculation = ['E = [TBD]'];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.END_USE,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_END_USE,
  );
}

export function assembleHydrogenEndUseEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance) {
    return [];
  }

  const hydrogenAmount = provenance.root.batch.amount;
  const hydrogenEndUse: ProcessStepEntity[] = provenance.getProcessStepsFromChain(ProcessType.HYDROGEN_END_USE);
  const hydrogenEndUseEmissionCalculation: ProofOfSustainabilityEmissionCalculationEntity[] = hydrogenEndUse.map(
    assembleHydrogenEndUseEmissionCalculation,
  );

  const totalEmissions = hydrogenEndUseEmissionCalculation.reduce((sum, curr) => sum + curr.result, 0);

  const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_END_USE,
    ),
  ];
}

export function calculateHydrogenEndUseEmissions(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const hydrogenEndUseEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.HYDROGEN_END_USE)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const hydrogenEndUseEmission = new ProofOfSustainabilityEmissionEntity(
    hydrogenEndUseEmissionAmount,
    EmissionStringConstants.TYPES.EHB,
    EmissionStringConstants.END_USE,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [hydrogenEndUseEmission];
}

export const hydrogenEndUseEmissionAssembler: ProofOfSustainabilityEmissionAssembler = {
  assembleEmissionCalculations: assembleHydrogenEndUseEmissionCalculations,
  calculateEmissions: calculateHydrogenEndUseEmissions,
};
