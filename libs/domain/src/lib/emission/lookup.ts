/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FUEL_EMISSION_FACTORS_G_CO2_PER_MJ_FUEL,
  POWER_EMISSION_FACTORS,
  TRAILER_DEPENDENT_PARAMETERS,
} from './constants';

export function getPowerEmissionFactorByEnergySource(energySource: string) {
  const key = (energySource ?? 'UNKNOWN').toUpperCase();
  const entry = POWER_EMISSION_FACTORS[key];

  if (!entry) {
    throw new Error(`Unknown or unsupported energy source: ${energySource ?? 'undefined'}`);
  }

  return entry;
}

export function getFuelEmissionFactorByFuelType(fuelType: string): number {
  const key = (fuelType ?? 'UNKNOWN').toUpperCase();
  const entry = FUEL_EMISSION_FACTORS_G_CO2_PER_MJ_FUEL[key];

  if (entry == null) {
    throw new Error(`Unknown or unsupported fuel type: ${fuelType ?? 'undefined'}`);
  }

  return entry;
}

export function getTrailerParameters(capacityKg: number) {
  const entry = TRAILER_DEPENDENT_PARAMETERS.find((e) => e.capacityKg === capacityKg);

  if (!entry) {
    throw new Error(`Unknown or unsupported trailer capacity (kg H₂): ${capacityKg ?? 'undefined'}`);
  }

  return entry;
}
