/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelType } from '../enums';
import { EnergySource } from '../enums/energy-source.enum';
import { PowerEmissionFactor, TrailerParameter } from './types';

export const UNIT_KM = 'km';
export const UNIT_KWH = 'kWh';
export const UNIT_L = 'L';
export const UNIT_KG_H2 = 'kg H₂';
export const UNIT_KWH_PER_KG_H2 = 'kWh / kg H₂';
export const UNIT_G_CO2 = 'g CO₂,eq';
export const UNIT_G_CO2_PER_KG_H2 = 'g CO₂,eq / kg H₂';
export const UNIT_G_CO2_PER_KWH = 'g CO₂,eq / kWh';
export const UNIT_G_CO2_PER_L = 'g CO₂,eq / L';
export const UNIT_G_CO2_PER_TON_KM = 'g CO₂,eq / (ton, km)';
export const UNIT_G_CO2_PER_MJ = 'g CO₂,eq / MJ';
export const UNIT_MJ_FUEL_PER_TON_KM = 'MJ fuel / (ton, km)';

export const CH4_N2O = 'CH₄ & N₂O';

export const EMISSION_FACTOR_DEIONIZED_WATER = 0.43;
export const GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG = 120;
export const FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ = 94;

export const POWER_EMISSION_FACTORS: Readonly<Record<EnergySource, PowerEmissionFactor>> = {
  [EnergySource.SOLAR_ENERGY]: { emissionFactor: 0, label: 'Solar Energy' },
  [EnergySource.WIND_ENERGY]: { emissionFactor: 0, label: 'Wind Energy' },
  [EnergySource.HYDRO_POWER]: { emissionFactor: 0, label: 'Hydro Energy' },
  [EnergySource.GRID]: { emissionFactor: 357.48, label: 'Grid' },
};

export const FUEL_EMISSION_FACTORS: Readonly<Record<FuelType, number>> = {
  [FuelType.DIESEL]: 95.1,
};

export const TRAILER_PARAMETERS: readonly TrailerParameter[] = [
  {
    capacity: 155,
    transportEfficiency: 132.2,
    emissionFactor: 86.699,
  },
  {
    capacity: 315,
    transportEfficiency: 65.0,
    emissionFactor: 42.628,
  },
  {
    capacity: 630,
    transportEfficiency: 39.7,
    emissionFactor: 26.036,
  },
  {
    capacity: 803,
    transportEfficiency: 30.4,
    emissionFactor: 19.937,
  },
  {
    capacity: 960,
    transportEfficiency: 25.1,
    emissionFactor: 16.461,
  },
  {
    capacity: 1195,
    transportEfficiency: 19.9,
    emissionFactor: 13.051,
  },
  {
    capacity: 1400,
    transportEfficiency: 16.7,
    emissionFactor: 10.952,
  },
];
