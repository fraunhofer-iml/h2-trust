/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionType } from '@prisma/client';
import { EnergySource, HydrogenColor, PowerProductionType as PowerProductionTypeName } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';

export const PowerProductionTypeSeed: readonly PowerProductionType[] = Object.freeze([
  {
    name: PowerProductionTypeName.PHOTOVOLTAIC_SYSTEM,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    energySource: EnergySource.SOLAR_ENERGY,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: PowerProductionTypeName.WIND_TURBINE,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    energySource: EnergySource.WIND_ENERGY,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: PowerProductionTypeName.HYDRO_POWER_PLANT,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    energySource: EnergySource.HYDRO_POWER,
    hydrogenColor: HydrogenColor.GREEN,
  },
  {
    name: PowerProductionTypeName.GRID,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    energySource: EnergySource.GRID,
    hydrogenColor: HydrogenColor.YELLOW,
  },
]);
