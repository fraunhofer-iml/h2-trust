/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationTopic, MeasurementUnit } from '@h2-trust/domain';
import { EmissionCalculationDto } from '../emission-calculation.dto';

export const emissionCalculationMock: EmissionCalculationDto[] = [
  {
    basisOfCalculation: ['E = Egrid + Esolar + Ewind '],
    calculationTopic: CalculationTopic.POWER_SUPPLY,
    name: 'Emissions (Hydrogen Production)',
    result: 17,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 1000 kWh/50 kg H2* 0 g CO2,eq/kWh'],
    calculationTopic: CalculationTopic.POWER_SUPPLY,
    name: 'Emissions (Wind Energy)',
    result: 0,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 1000 kWh/50 kg H2* 0 g CO2,eq/kWh'],
    calculationTopic: CalculationTopic.POWER_SUPPLY,
    name: 'Emissions (Solar Energy)',
    result: 0,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 2,37 kWh/50 kg H2* 0 g CO2,eq/kWh'],
    calculationTopic: CalculationTopic.POWER_SUPPLY,
    name: 'Emissions (Grid Energy)',
    result: 13.2,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = E(tap) + E(deionized)'],
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Water Supply)',
    result: 4.15,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 10l/kgH2 * 0,2g CO2,eq/l'],
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Tap Water)',
    result: 2,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 5l/kgH2 * 0,43g CO2,eq/l'],
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Deionized Supply)',
    result: 2.15,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
  {
    basisOfCalculation: ['E = 357,48 g CO2,eq/kWh * 1,65 kWh/kg H2'],
    calculationTopic: CalculationTopic.HYDROGEN_BOTTLING,
    name: 'Emissions (Compression)',
    result: 45,
    unit: MeasurementUnit.G_CO2_PER_KG_H2,
  },
];
