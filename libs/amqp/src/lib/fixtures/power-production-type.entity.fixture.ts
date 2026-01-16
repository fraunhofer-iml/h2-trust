/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeEntity } from '@h2-trust/amqp';
import { EnergySource, HydrogenColor, PowerProductionType } from '@h2-trust/domain';

export const PowerProductionTypeEntityFixture = {
  createSolarEnergy: (overrides: Partial<PowerProductionTypeEntity> = {}): PowerProductionTypeEntity =>
    new PowerProductionTypeEntity(
      overrides.name ?? PowerProductionType.PHOTOVOLTAIC_SYSTEM,
      overrides.energySource ?? EnergySource.SOLAR_ENERGY,
      overrides.hydrogenColor ?? HydrogenColor.GREEN,
    ),

  createWindEnergy: (overrides: Partial<PowerProductionTypeEntity> = {}): PowerProductionTypeEntity =>
    new PowerProductionTypeEntity(
      overrides.name ?? PowerProductionType.WIND_TURBINE,
      overrides.energySource ?? EnergySource.WIND_ENERGY,
      overrides.hydrogenColor ?? HydrogenColor.GREEN,
    ),

  createHydroPower: (overrides: Partial<PowerProductionTypeEntity> = {}): PowerProductionTypeEntity =>
    new PowerProductionTypeEntity(
      overrides.name ?? PowerProductionType.HYDRO_POWER_PLANT,
      overrides.energySource ?? EnergySource.HYDRO_POWER,
      overrides.hydrogenColor ?? HydrogenColor.GREEN,
    ),

  createGrid: (overrides: Partial<PowerProductionTypeEntity> = {}): PowerProductionTypeEntity =>
    new PowerProductionTypeEntity(
      overrides.name ?? PowerProductionType.GRID,
      overrides.energySource ?? EnergySource.GRID,
      overrides.hydrogenColor ?? HydrogenColor.YELLOW,
    ),
} as const;
