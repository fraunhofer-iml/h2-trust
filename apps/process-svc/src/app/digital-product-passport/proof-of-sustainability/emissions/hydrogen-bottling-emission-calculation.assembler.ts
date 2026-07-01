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

export function assembleHydrogenBottlingEmissionCalculation(
  hydrogenBottling: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
    throw new InternalException(
      `Invalid process step type [${hydrogenBottling?.type}] for hydrogen bottling emission calculation`,
    );
  }

  const usedGridPower = hydrogenBottling.batch?.details?.usedGridPower ?? 0;
  const gridPowerEmissions = usedGridPower * EmissionNumericConstants.GRID_POWER_PER_KWH;
  const usedRenewablePower = hydrogenBottling.batch?.details?.usedRenewablePower ?? 0;
  const renewablePowerEmissions = 0;
  const usedCompressedAir = hydrogenBottling.batch?.details?.compressedAir ?? 0;
  const compressedAirEmissions = usedCompressedAir * EmissionNumericConstants.COMPRESSED_AIR_PER_M3;
  const usedNitrogen = hydrogenBottling.batch?.details?.nitrogenConsumption ?? 0;
  const nitrogenEmissions = usedNitrogen * EmissionNumericConstants.NITROGEN_PER_KG;

  const result = gridPowerEmissions + renewablePowerEmissions + compressedAirEmissions + nitrogenEmissions;

  const usedGridPowerInput = `Used Grid Power: ${usedGridPower} kwh`;
  const usedRenewablePowerInput = `Used Renewable Power: ${usedRenewablePower} kwh`;
  const usedCompressedAirInput = `Used Compressed Air: ${usedCompressedAir} m³`;
  const usedNitrogenInput = `Used Nitrogen: ${usedNitrogen} kg`;
  const basisOfCalculation = [usedGridPowerInput, usedRenewablePowerInput, usedCompressedAirInput, usedNitrogenInput];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.HYDROGEN_BOTTLING,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_BOTTLING,
  );
}

export function assembleHydrogenBottlingEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance) {
    return [];
  }

  const hydrogenAmount = provenance.root.batch.amount;
  const hydrogenBottling: ProcessStepEntity[] = provenance.getProcessStepsFromChain(ProcessType.HYDROGEN_BOTTLING);
  const hydrogenBottlingEmissionCalculation: ProofOfSustainabilityEmissionCalculationEntity[] = hydrogenBottling.map(
    assembleHydrogenBottlingEmissionCalculation,
  );

  const totalEmissions = hydrogenBottlingEmissionCalculation.reduce((sum, curr) => sum + curr.result, 0);

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

export function calculateHydrogenBottlingEmissions(
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

export const hydrogenBottlingEmissionAssembler: ProofOfSustainabilityEmissionAssembler = {
  assembleEmissionCalculations: assembleHydrogenBottlingEmissionCalculations,
  calculateEmissions: calculateHydrogenBottlingEmissions,
};
