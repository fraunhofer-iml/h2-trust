/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationTopic } from '@h2-trust/domain';
import { EmissionCalculationDto } from '../emission-calculation.dto';

export const emissionCalculationMock: EmissionCalculationDto[] = [
  {
    basisOfCalculation: 'E = Egrid + Esolar + Ewind ',
    calculationTopic: CalculationTopic.POWER_PRODUCTION,
    name: 'Emissions (Power Production)',
    result: 17,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 1000 kWh/50 kg H2* 0 g CO2,eq/kWh',
    calculationTopic: CalculationTopic.POWER_PRODUCTION,
    name: 'Emissions (Wind Energy)',
    result: 0,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 1000 kWh/50 kg H2* 0 g CO2,eq/kWh',
    calculationTopic: CalculationTopic.POWER_PRODUCTION,
    name: 'Emissions (Solar Energy)',
    result: 0,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 2,37 kWh/50 kg H2* 0 g CO2,eq/kWh',
    calculationTopic: CalculationTopic.POWER_PRODUCTION,
    name: 'Emissions (Grid Energy)',
    result: 13.2,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = E(tap) + E(deionized)',
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Water Supply)',
    result: 4.15,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 10l/kgH2 * 0,2g CO2,eq/l',
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Tap Water)',
    result: 2,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 5l/kgH2 * 0,43g CO2,eq/l',
    calculationTopic: CalculationTopic.WATER_SUPPLY,
    name: 'Emissions (Deionized Supply)',
    result: 2.15,
    unit: 'g CO₂,eq/kg H₂',
  },
  {
    basisOfCalculation: 'E = 357,48 g CO2,eq/kWh * 1,65 kWh/kg H2',
    calculationTopic: CalculationTopic.HYDROGEN_BOTTLING,
    name: 'Emissions (Compression)',
    result: 45,
    unit: 'g CO₂,eq/kg H₂',
  },
];
