/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  hydrogenProductionUnitQueryArgs,
  hydrogenProductionUnitRefDeepQueryArgs,
  hydrogenProductionUnitRefShallowQueryArgs,
  hydrogenProductionUnitRefSurfaceQueryArgs,
} from '../query-args';

export type HydrogenProductionUnitDbType = Prisma.UnitGetPayload<typeof hydrogenProductionUnitQueryArgs>;

export type HydrogenProductionUnitRefDeepDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitRefDeepQueryArgs
>;

export type HydrogenProductionUnitRefShallowDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitRefShallowQueryArgs
>;

export type HydrogenProductionUnitRefSurfaceDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitRefSurfaceQueryArgs
>;
