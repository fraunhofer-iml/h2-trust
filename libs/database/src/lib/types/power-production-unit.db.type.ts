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
  powerProductionUnitFlatQueryArgs,
  powerProductionUnitNestedQueryArgs,
  powerProductionUnitQueryArgs,
} from '../query-args';

//TODO-LG (DUHGW-353): Replace with a deep, nested or flat type if possible
export type PowerProductionUnitDbType = Prisma.UnitGetPayload<typeof powerProductionUnitQueryArgs>;

export type PowerProductionUnitDeepDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitDeepQueryArgs
>;

export type PowerProductionUnitNestedDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitNestedQueryArgs
>;

export type PowerProductionUnitFlatDbType = Prisma.PowerProductionUnitGetPayload<
  typeof powerProductionUnitFlatQueryArgs
>;
