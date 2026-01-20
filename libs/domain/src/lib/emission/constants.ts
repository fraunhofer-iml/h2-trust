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

export const UNIT_G_CO2 = 'g CO₂,eq';
export const UNIT_G_CO2_PER_KG_H2 = 'g CO₂,eq/kg H₂';
export const UNIT_G_CO2_PER_KWH = 'g CO₂,eq/kWh';
export const GRAVIMETRIC_ENERGY_DENSITY_H2_MJ_PER_KG = 120;
export const FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ = 94;

export const POWER_EMISSION_FACTORS: Readonly<Record<EnergySource, PowerEmissionFactor>> = {
  [EnergySource.SOLAR_ENERGY]: { emissionFactor: 0, label: 'Emissions (Solar Energy)' },
  [EnergySource.WIND_ENERGY]: { emissionFactor: 0, label: 'Emissions (Wind Energy)' },
  [EnergySource.HYDRO_POWER]: { emissionFactor: 0, label: 'Emissions (Hydro Energy)' },
  [EnergySource.GRID]: { emissionFactor: 357.48, label: 'Emissions (Grid)' },
};

export const FUEL_EMISSION_FACTORS: Readonly<Record<FuelType, number>> = {
  [FuelType.DIESEL]: 95.1,
};

export const TRAILER_PARAMETERS: readonly TrailerParameter[] = [
  {
    capacityKg: 155,
    transportEfficiencyMJPerTonnePerKm: 132.2,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 86.699,
  },
  {
    capacityKg: 315,
    transportEfficiencyMJPerTonnePerKm: 65.0,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 42.628,
  },
  {
    capacityKg: 630,
    transportEfficiencyMJPerTonnePerKm: 39.7,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 26.036,
  },
  {
    capacityKg: 803,
    transportEfficiencyMJPerTonnePerKm: 30.4,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 19.937,
  },
  {
    capacityKg: 960,
    transportEfficiencyMJPerTonnePerKm: 25.1,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 16.461,
  },
  {
    capacityKg: 1195,
    transportEfficiencyMJPerTonnePerKm: 19.9,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 13.051,
  },
  {
    capacityKg: 1400,
    transportEfficiencyMJPerTonnePerKm: 16.7,
    gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: 10.952,
  },
];
