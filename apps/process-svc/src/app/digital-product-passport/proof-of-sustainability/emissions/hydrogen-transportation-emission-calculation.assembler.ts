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
import {
  CalculationTopic,
  EmissionNumericConstants,
  EmissionStringConstants,
  FuelType,
  MeasurementUnit,
  ProcessType,
  TransportType,
  UnitType,
} from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { getFuelType } from '@h2-trust/strings';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
import { ProofOfSustainabilityEmissionAssembler } from '../proof-of-sustainability-assembler.interface';

function assemblePipelineEmissionCalculation(): ProofOfSustainabilityEmissionCalculationEntity {
  const result = 0;
  const basisOfCalculation = [`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.HYDROGEN_TRANSPORTATION_PIPELINE,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_TRANSPORTATION,
  );
}

function assembleTrailerEmissionCalculation(
  hydrogenAmount: number,
  fuelType: FuelType,
  transportDistance: number,
): ProofOfSustainabilityEmissionCalculationEntity {
  const trailerParameter =
    EmissionNumericConstants.TRAILER_PARAMETERS.find((trailerEntry) => hydrogenAmount <= trailerEntry.capacity) ??
    EmissionNumericConstants.TRAILER_PARAMETERS.at(EmissionNumericConstants.TRAILER_PARAMETERS.length - 1);
  assertDefined(trailerParameter, 'trailerParameter');

  const tonPerKg = 0.001;
  const transportEfficiency = trailerParameter.transportEfficiency;
  const amountOfFuelPerTonOfHydrogen = transportDistance * transportEfficiency;
  const emissionFactorFuel = EmissionNumericConstants.FUEL_EMISSION_FACTORS[fuelType];
  const emissionsFuelCombustion = tonPerKg * amountOfFuelPerTonOfHydrogen * emissionFactorFuel;
  const emissionFactorCh4AndN2O = trailerParameter.emissionFactor;
  const emissionCh4AndN2O = tonPerKg * transportDistance * emissionFactorCh4AndN2O;
  const result = (emissionsFuelCombustion + emissionCh4AndN2O) * hydrogenAmount;

  const fuelTypeLabel = getFuelType(fuelType);
  const tonPerKgInput = `Ton per Kg: ${tonPerKg} ton/kg`;
  const transportDistanceInput = `Transport Distance: ${transportDistance} ${MeasurementUnit.KM}`;
  const transportEfficiencyInput = `Transport Efficiency: ${transportEfficiency} ${MeasurementUnit.MJ_FUEL_PER_TON_KM}`;
  const emissionFactorFuelInput = `Emission Factor ${fuelTypeLabel}: ${emissionFactorFuel} ${MeasurementUnit.G_CO2_PER_MJ}`;
  const emissionFactorCh4AndN2OInput = `Emission Factor ${EmissionStringConstants.CH4_N2O}: ${emissionFactorCh4AndN2O} ${MeasurementUnit.G_CO2_PER_TON_KM}`;
  const hydrogenTransportedInput = `Hydrogen Transported: ${hydrogenAmount} ${MeasurementUnit.KG_H2}`;
  const emissionFuelCombustionFormula = `Emission Fuel Combustion = Ton per Kg * Transport Distance * Transport Efficiency * Emission Factor ${fuelTypeLabel}`;
  const emissionCh4AndN2OFormula = `Emission ${EmissionStringConstants.CH4_N2O} = Ton per Kg * Transport Distance * Emission Factor ${EmissionStringConstants.CH4_N2O}`;
  const formula = `E = (Emission Fuel Combustion + Emission ${EmissionStringConstants.CH4_N2O}) * Hydrogen Transported`;
  const basisOfCalculation = [
    tonPerKgInput,
    transportDistanceInput,
    transportEfficiencyInput,
    emissionFactorFuelInput,
    emissionFactorCh4AndN2OInput,
    hydrogenTransportedInput,
    emissionFuelCombustionFormula,
    emissionCh4AndN2OFormula,
    formula,
  ];

  return new ProofOfSustainabilityEmissionCalculationEntity(
    EmissionStringConstants.HYDROGEN_TRANSPORTATION_TRAILER,
    basisOfCalculation,
    result,
    MeasurementUnit.G_CO2,
    CalculationTopic.HYDROGEN_TRANSPORTATION,
  );
}

export function assembleHydrogenTransportationEmissionCalculation(
  hydrogenTransportation: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity {
  if (hydrogenTransportation?.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
    throw new InternalException(
      `Invalid process step type [${hydrogenTransportation?.type}] for hydrogen transportation emission calculation`,
    );
  }

  if (hydrogenTransportation?.executedBy.unitType !== UnitType.TRANSPORTATION) {
    throw new InternalException(
      `Invalid unit type [${hydrogenTransportation?.executedBy.unitType}] for hydrogen transportation emission calculation`,
    );
  }

  const transportUnit: UnitEntity = hydrogenTransportation.executedBy;

  assertValidEnum(transportUnit.details.type, TransportType, 'TransportType');

  const transportMode: string = transportUnit?.details?.type;

  switch (transportMode) {
    case TransportType.PIPELINE:
      return assemblePipelineEmissionCalculation();
    case TransportType.TRAILER:
      return assembleTrailerEmissionCalculation(
        hydrogenTransportation.batch.amount,
        transportUnit.details?.fuelType,
        hydrogenTransportation.batch?.details?.distance,
      );
    default:
      throw new InternalException(
        `Unknown transport mode [${transportMode}] for process step [${hydrogenTransportation.id}]`,
      );
  }
}

export function assembleHydrogenTransportationEmissionCalculations(
  provenance: ProvenanceEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (!provenance || provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
    return [];
  }

  const hydrogenAmount = provenance.root.batch.amount;
  const hydrogenTransportation = assembleHydrogenTransportationEmissionCalculation(provenance.root);

  const totalEmissions = hydrogenTransportation.result;
  const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
  const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_TRANSPORTATION,
    ),
  ];
}

export function calculateHydrogenTransportationEmissions(
  emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
): ProofOfSustainabilityEmissionEntity[] {
  const hydrogenTransportationEmissionAmount = emissionCalculations
    .filter((emissionCalculation) => emissionCalculation.calculationTopic === CalculationTopic.HYDROGEN_TRANSPORTATION)
    .reduce((acc, emissionCalculation) => acc + Number(emissionCalculation.name), 0);

  const hydrogenTransportationEmission = new ProofOfSustainabilityEmissionEntity(
    hydrogenTransportationEmissionAmount,
    EmissionStringConstants.TYPES.EHT,
    EmissionStringConstants.HYDROGEN_TRANSPORTATION,
    EmissionStringConstants.TYPES.APPLICATION,
  );

  return [hydrogenTransportationEmission];
}

export const hydrogenTransportationEmissionAssembler: ProofOfSustainabilityEmissionAssembler = {
  assembleEmissionCalculations: assembleHydrogenTransportationEmissionCalculations,
  calculateEmissions: calculateHydrogenTransportationEmissions,
};
