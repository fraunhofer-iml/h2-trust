/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfSustainabilityEmissionCalculationEntity } from '@h2-trust/amqp';
import { EnumLabelMapper } from '@h2-trust/strings';
import {
  CalculationTopic,
  EmissionNumericConstants,
  EmissionStringConstants,
  EnergySource,
  MeasurementUnit,
  PowerType,
  ProcessType,
} from '@h2-trust/domain';

export function computeHydrogenStorageEmissionCalculations(
  hydrogenProduction: ProcessStepEntity,
): ProofOfSustainabilityEmissionCalculationEntity[] {
  if (hydrogenProduction?.type !== ProcessType.HYDROGEN_PRODUCTION) {
    return [];
  }

  const powerType: PowerType = hydrogenProduction.batch.qualityDetails.powerType as PowerType;
  const emissionFactor = EmissionNumericConstants.POWER_TYPE_EMISSION_FACTORS[powerType];

  const result =
    EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2 * emissionFactor * hydrogenProduction.batch.amount;

  const hydrogenProducedKgInput = `Hydrogen Produced: ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;
  const emissionFactorLabel = EnumLabelMapper.getEnergySource(EnergySource.GRID);
  const energyDemandInput = `Energy Demand: ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2}`;
  const emissionFactorInput = `Emission Factor ${emissionFactorLabel}: ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH}`;
  const formula = `E = Energy Demand * Emission Factor ${emissionFactorLabel} * Hydrogen Produced`;
  const formulaResult = `${result} ${MeasurementUnit.G_CO2} = ${EmissionNumericConstants.ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2} ${MeasurementUnit.KWH_PER_KG_H2} * ${emissionFactor} ${MeasurementUnit.G_CO2_PER_KWH} * ${hydrogenProduction.batch.amount} ${MeasurementUnit.KG_H2}`;

  const basisOfCalculation = [energyDemandInput, emissionFactorInput, hydrogenProducedKgInput, formula, formulaResult];

  return [
    new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.COMPRESSION,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_STORAGE,
    ),
  ];
}
