/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelType } from '../enums';
import { EnergySource } from '../enums/energy-source.enum';

export interface TrailerParameter {
  capacity: number;
  transportEfficiency: number;
  emissionFactor: number;
}

export const EmissionNumericConstants = {
  ENERGY_DEMAND_COMPRESSION_KWH_PER_KG_H2: 1.65, // 5.93 / 3.6 -> default values for compression from 30 bar to 300 bar
  EMISSION_FACTOR_DEIONIZED_WATER_G_CO2_PER_L: 0.43,
  H2_LOWER_HEATING_VALUE_MJ_PER_KG: 120,
  FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ: 94,

  ENERGY_SOURCE_EMISSION_FACTORS: {
    [EnergySource.SOLAR_ENERGY]: 0,
    [EnergySource.WIND_ENERGY]: 0,
    [EnergySource.HYDRO_POWER]: 0,
    [EnergySource.GRID]: 357.48,
  } as Readonly<Record<EnergySource, number>>,

  FUEL_EMISSION_FACTORS: {
    [FuelType.DIESEL]: 95.1,
  } as Readonly<Record<FuelType, number>>,

  TRAILER_PARAMETERS: [
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
  ] as readonly TrailerParameter[],
} as const;
