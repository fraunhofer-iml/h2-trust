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
  UnitEntity,
} from '@h2-trust/contracts/entities';
import { CalculationTopic, EmissionNumericConstants, EmissionStringConstants, MeasurementUnit } from '@h2-trust/domain';
import { ProofOfSustainabilityEmissionAssembler } from '../proof-of-sustainability-assembler.interface';
import { assembleHydrogenStorageEmissionCalculations } from './hydrogen-storage-emission-calculation.assembler';

function assembleWasteWaterEmissionCalculations(
  hydrogenProduction: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  const productionAmount: number = hydrogenProduction.batch.amount;
  const hydrogenProductionUnit: UnitEntity = hydrogenProduction.executedBy;

  const wasteWaterConsumptionOfUnit: number = hydrogenProductionUnit?.details?.wasteWaterConsumptionLitersPerKgH2 ?? 0;
  const wasteWaterConsumptionOfProduction: number = wasteWaterConsumptionOfUnit * productionAmount;
  const wasteWaterResult: number =
    wasteWaterConsumptionOfProduction * EmissionNumericConstants.EMISSION_FACTOR_WASTE_WATER_G_CO2_PER_L;
  const wasteWaterEmissionFactorLabel = EmissionStringConstants.WASTE_WATER;
  const wasteWaterOutput = `Waste Water Output: ${wasteWaterConsumptionOfProduction} ${MeasurementUnit.L}`;
  const wasteWaterEmissionFactor = `Emission Factor ${wasteWaterEmissionFactorLabel}: ${EmissionNumericConstants.EMISSION_FACTOR_WASTE_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;
  const wasteWatterFormula = `E = Waste Water Output * Emission Factor ${wasteWaterEmissionFactorLabel}`;
  const wasteWaterFormulaResult = `${wasteWaterResult} ${MeasurementUnit.G_CO2} = ${wasteWaterOutput} ${MeasurementUnit.L} * ${EmissionNumericConstants.EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L} ${MeasurementUnit.G_CO2_PER_L}`;

  const basisOfCalculation = [wasteWaterOutput, wasteWaterEmissionFactor, wasteWatterFormula, wasteWaterFormulaResult];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.WASTE_WATER,
    basisOfCalculation,
    wasteWaterResult,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_PRODUCTION,
  );
}

function assembleResinEmissionCaclulations(
  hydrogenProduction: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  const productionAmount: number = hydrogenProduction.batch.amount;
  const hydrogenProductionUnit: UnitEntity = hydrogenProduction.executedBy;

  const resinConsumptionOfUnit: number = hydrogenProductionUnit?.details?.resinConsumptionKgPerKgH2 ?? 0;
  const resinConsumptionOfProduction: number = resinConsumptionOfUnit * productionAmount;
  const resinResult: number =
    resinConsumptionOfProduction * EmissionNumericConstants.EMISSION_FACTOR_RESIN_G_CO2_PER_KG;
  const resinEmissionFactorLabel = EmissionStringConstants.RESIN;
  const resinOutput = `Resin Input: ${resinConsumptionOfProduction} ${MeasurementUnit.KG}`;
  const resinEmissionFactor = `Emission Factor ${resinEmissionFactorLabel}: ${EmissionNumericConstants.EMISSION_FACTOR_RESIN_G_CO2_PER_KG} ${MeasurementUnit.G_CO2_PER_L}`;
  const resinFormula = `E = Waste Water Output * Emission Factor ${resinEmissionFactorLabel}`;
  const resinFormulaResult = `${resinResult} ${MeasurementUnit.G_CO2} = ${resinOutput} ${MeasurementUnit.KG} * ${EmissionNumericConstants.EMISSION_FACTOR_RESIN_G_CO2_PER_KG} ${MeasurementUnit.KG_PER_KG_H2}`;

  const basisOfCalculation = [resinOutput, resinEmissionFactor, resinFormula, resinFormulaResult];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.RESIN,
    basisOfCalculation,
    resinResult,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_PRODUCTION,
  );
}

export function assembleProductionEmissionCalculations(
  hydrogenProduction: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  const wasteWaterEmissions = assembleWasteWaterEmissionCalculations(hydrogenProduction);
  const resinEmissions = assembleResinEmissionCaclulations(hydrogenProduction);

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.HYDROGEN_PRODUCTION,
    [...wasteWaterEmissions.basisOfCalculation, ...resinEmissions.basisOfCalculation],
    wasteWaterEmissions.result + resinEmissions.result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_PRODUCTION,
  );
}

export function assembleHydrogenProductionEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  const hydrogenAmount = provenance.root.batch.amount;

  const hydrogenStorageEmissionCalculations = provenance
    .getAllHydrogenLeafProductions()
    .flatMap((hydrogenProduction) => {
      const wasteWaterEmissionCalculations = assembleWasteWaterEmissionCalculations(hydrogenProduction);
      const resinEmissionCalculations = assembleResinEmissionCaclulations(hydrogenProduction);
      const storageEmissionCalculations = assembleHydrogenStorageEmissionCalculations(hydrogenProduction);
      return [wasteWaterEmissionCalculations, resinEmissionCalculations, ...storageEmissionCalculations];
    });

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
