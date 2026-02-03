/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  powerProductionUnitQueryArgs,
  powerProductionUnitRefDeepQueryArgs,
  powerProductionUnitRefShallowQueryArgs,
  powerProductionUnitRefSurfaceQueryArgs,
} from '../query-args';

export type PowerProductionUnitDbType = Prisma.UnitGetPayload<typeof powerProductionUnitQueryArgs>;

export type PowerProductionRefUniRefDeepDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitRefDeepQueryArgs
>;

export type PowerProductionUnitRefShallowDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitRefShallowQueryArgs
>;

export type PowerProductionUnitRefSurfaceDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitRefSurfaceQueryArgs
>;
