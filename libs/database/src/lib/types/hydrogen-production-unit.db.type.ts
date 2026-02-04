/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  hydrogenProductionUnitDeepQueryArgs,
  hydrogenProductionUnitQueryArgs,
  hydrogenProductionUnitShallowQueryArgs,
  hydrogenProductionUnitSurfaceQueryArgs,
} from '../query-args';

//TODO-LG: Replace with a deep, shallow or surface type if possible
export type HydrogenProductionUnitDbType = Prisma.UnitGetPayload<typeof hydrogenProductionUnitQueryArgs>;

export type HydrogenProductionUnitDeepDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitDeepQueryArgs
>;

export type HydrogenProductionUnitShallowDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitShallowQueryArgs
>;

export type HydrogenProductionUnitSurfaceDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitSurfaceQueryArgs
>;
