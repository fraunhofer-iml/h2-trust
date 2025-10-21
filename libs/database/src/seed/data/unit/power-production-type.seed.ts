/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionType } from '@prisma/client';
import { EnergySource, HydrogenColor, PowerProductionType as PowerProductionTypeName } from '@h2-trust/domain';

export const PowerProductionTypeSeed = <PowerProductionType[]>[
  {
    name: PowerProductionTypeName.PHOTOVOLTAIC_SYSTEM,
    energySource: EnergySource.SOLAR_ENERGY,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: PowerProductionTypeName.WIND_TURBINE,
    energySource: EnergySource.WIND_ENERGY,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: PowerProductionTypeName.HYDRO_POWER_PLANT,
    energySource: EnergySource.HYDRO_POWER,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: 'BIOGAS_PLANT',
    energySource: 'BIOMASS',
    hydrogenColor: HydrogenColor.ORANGE,
  },
  {
    name: 'BIOMASS_COGENERATION_PLANT',
    energySource: 'BIOMASS',
    hydrogenColor: HydrogenColor.ORANGE,
  },
  {
    name: 'NUCLEAR_POWER_PLANT',
    energySource: 'NUCLEAR_ENERGY',
    hydrogenColor: HydrogenColor.PINK,
  },
  {
    name: 'HARD_COAL_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'LIGNITE_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'OIL_FIRED_POWER_PLANT',
    energySource: 'FOSSIL_FUELS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'NATURAL_GAS_POWER_PLANT',
    energySource: 'MINE_GAS',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: 'GEOTHERMAL_POWER_PLANT',
    energySource: 'GEOTHERMAL_ENERGY',
    hydrogenColor: HydrogenColor.YELLOW,
  },
  {
    name: PowerProductionTypeName.GRID,
    energySource: EnergySource.GRID,
    hydrogenColor: HydrogenColor.YELLOW,
  },
];
