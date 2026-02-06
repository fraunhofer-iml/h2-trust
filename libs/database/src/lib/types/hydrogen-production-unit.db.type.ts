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
  hydrogenProductionUnitFlatQueryArgs,
  hydrogenProductionUnitNestedQueryArgs,
  hydrogenProductionUnitQueryArgs,
} from '../query-args';

//TODO-LG (DUHGW-353): Replace with a deep, nested or flat type if possible
export type HydrogenProductionUnitDbType = Prisma.UnitGetPayload<typeof hydrogenProductionUnitQueryArgs>;

export type HydrogenProductionUnitDeepDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitDeepQueryArgs
>;

export type HydrogenProductionUnitNestedDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitNestedQueryArgs
>;

export type HydrogenProductionUnitFlatDbType = Prisma.HydrogenProductionUnitGetPayload<
  typeof hydrogenProductionUnitFlatQueryArgs
>;
