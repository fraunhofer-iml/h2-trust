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
import {
  CalculationTopic,
  EmissionNumericConstants,
  EmissionStringConstants,
  MeasurementUnit,
  ProcessType,
} from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { ProofOfSustainabilityEmissionAssembler } from '../proof-of-sustainability-assembler.interface';

export function assembleHydrogenCompressionEmissionCalculation(
  hydrogenCompression: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (hydrogenCompression?.type !== ProcessType.HYDROGEN_COMPRESSION) {
    throw new InternalException(
      `Invalid process step type [${hydrogenCompression?.type}] for hydrogen compression emission calculation`,
    );
  }

  const usedGridPower = hydrogenCompression.batch?.qualityDetails?.usedGridPower ?? 0;
  const gridPowerEmissions = usedGridPower * EmissionNumericConstants.GRID_POWER_PER_KWH;
  const usedRenewablePower = hydrogenCompression.batch?.qualityDetails?.usedRenewablePower ?? 0;
  const renewablePowerEmissions = 0;
  const result = gridPowerEmissions + renewablePowerEmissions;

  const usedGridPowerInput = `Used Grid Power: ${usedGridPower} kwh`;
  const usedRenewablePowerInput = `Used Grid Power: ${usedRenewablePower} kwh`;
  const basisOfCalculation = [usedGridPowerInput, usedRenewablePowerInput];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.COMPRESSION,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_COMPRESSION,
  );
}

export function assembleHydrogenCompressionEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance) {
    return [];
  }

  const hydrogenAmount = provenance.root.batch.amount;
  const hydrogenCompression: ProcessStepEntity[] = provenance.getProcessStepsFromChain(
    ProcessType.HYDROGEN_COMPRESSION,
  );
  const hydrogenCompressionEmissionCalculation: ProofOfSustainabilityEmissionCalculationEntity[] =
    hydrogenCompression.map(assembleHydrogenCompressionEmissionCalculation);

  const totalEmissions = hydrogenCompressionEmissionCalculation.reduce((sum, curr) => sum + curr.result, 0);

  const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_COMPRESSION,
    ),
  ];
}

export function calculateHydrogenCompressionEmissions(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const hydrogenCompressionEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.HYDROGEN_COMPRESSION)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const hydrogenCompressionEmission = new ProofOfSustainabilityEmissionEntity(
    hydrogenCompressionEmissionAmount,
    EmissionStringConstants.TYPES.EHB,
    EmissionStringConstants.COMPRESSION,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [hydrogenCompressionEmission];
}

export const hydrogenCompressionEmissionAssembler: ProofOfSustainabilityEmissionAssembler = {
  assembleEmissionCalculations: assembleHydrogenCompressionEmissionCalculations,
  calculateEmissions: calculateHydrogenCompressionEmissions,
};
