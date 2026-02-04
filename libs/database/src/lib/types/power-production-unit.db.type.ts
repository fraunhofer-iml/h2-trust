/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  powerProductionUnitDeepQueryArgs,
  powerProductionUnitQueryArgs,
  powerProductionUnitShallowQueryArgs,
  powerProductionUnitSurfaceQueryArgs,
} from '../query-args';

//TODO-LG: Replace with a deep, shallow or surface type if possible
export type PowerProductionUnitDbType = Prisma.UnitGetPayload<typeof powerProductionUnitQueryArgs>;

export type PowerProductionUniRefDeepDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitDeepQueryArgs
>;

export type PowerProductionUnitShallowDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitShallowQueryArgs
>;

export type PowerProductionUnitSurfaceDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitSurfaceQueryArgs
>;
