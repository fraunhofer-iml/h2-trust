/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  hydrogenStorageUnitDeepQueryArgs,
  hydrogenStorageUnitQueryArgs,
  hydrogenStorageUnitShallowQueryArgs,
  hydrogenStorageUnitSurfaceQueryArgs,
} from '../query-args';

//TODO-LG: Replace with a deep, shallow or surface type if possible
export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitQueryArgs>;

export type HydrogenStorageUnitDeepDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitDeepQueryArgs
>;

export type HydrogenStorageUnitShallowDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitShallowQueryArgs
>;

export type HydrogenStorageUnitSurfaceDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitSurfaceQueryArgs
>;
