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
  hydrogenStorageUnitFlatQueryArgs,
  hydrogenStorageUnitNestedQueryArgs,
  hydrogenStorageUnitQueryArgs,
} from '../query-args';

//TODO-LG: Replace with a deep, nested or flat type if possible
export type HydrogenStorageUnitDbType = Prisma.UnitGetPayload<typeof hydrogenStorageUnitQueryArgs>;

export type HydrogenStorageUnitDeepDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitDeepQueryArgs
>;

export type HydrogenStorageUnitNestedDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitNestedQueryArgs
>;

export type HydrogenStorageUnitFlatDbType = Prisma.HydrogenStorageUnitGetPayload<
  typeof hydrogenStorageUnitFlatQueryArgs
>;
