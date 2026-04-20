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
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';

export function assembleWaterSupplyEmissionCalculation(
  waterSupply: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (waterSupply?.type !== ProcessType.WATER_CONSUMPTION) {
    throw new Error(`Invalid process step type [${waterSupply?.type}] for water supply emission calculation`);
  }

  const waterInput = waterSupply.batch.amount;
  const result = waterInput * EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L;
  const emissionFactorLabel = EmissionStringConstants.DEIONIZED_WATER;
  const waterInputInput = `Water Input: ${waterInput} ${MeasurementUnit.L}`;
  const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;
  const formula = `E = Water Input * Emission Factor ${emissionFactorLabel}`;
  const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${waterInput} ${MeasurementUnit.L} * ${EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;
  const basisOfCalculation = [waterInputInput, emissionFactorInput, formula, formulaResult];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.WATER_SUPPLY,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.WATER_SUPPLY,
  );
}

export function assembleWaterConsumptionEmissions(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance.getAllWaterConsumptions()) {
    return [];
  }

  const hydrogenAmount = provenance.hydrogenBottling
    ? provenance.hydrogenBottling.batch.amount
    : provenance.root.batch.amount;
  const waterConsumptionEmissionCalculations = provenance
    .getAllWaterConsumptions()
    .map((waterConsumption) => assembleWaterSupplyEmissionCalculation(waterConsumption));

  const totalEmissions = waterConsumptionEmissionCalculations.reduce((acc, wc) => acc + wc.result, 0);
  const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.WATER_SUPPLY,
    ),
  ];
}

export function calculateWaterSupplyEmission(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const waterSupplyEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.WATER_SUPPLY)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const waterSupplyEmission = new ProofOfSustainabilityEmissionEntity(
    waterSupplyEmissionAmount,
    EmissionStringConstants.TYPES.EWS,
    EmissionStringConstants.WATER_SUPPLY,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [waterSupplyEmission];
}

export const waterConsumptionProofOfSustainabilityAssembler: ProofOfSustainabilityAssembler = {
  assembleEmissions: assembleWaterConsumptionEmissions,
  calculateEmission: calculateWaterSupplyEmission,
};
