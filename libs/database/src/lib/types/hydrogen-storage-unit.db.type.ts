/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  hydrogenStorageUnitQueryArgs,
  hydrogenStorageUnitRefDeepQueryArgs,
  hydrogenStorageUnitRefShallowQueryArgs,
  hydrogenStorageUnitRefSurfaceQueryArgs,
} from '../query-args';

export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitQueryArgs>;

export type HydrogenStorageUnitRefDeepDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitRefDeepQueryArgs
>;

export type HydrogenStorageUnitRefShallowDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitRefShallowQueryArgs
>;

export type HydrogenStorageUnitRefSurfaceDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitRefSurfaceQueryArgs
>;
