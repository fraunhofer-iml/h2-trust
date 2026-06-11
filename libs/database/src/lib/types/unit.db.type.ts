/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { unitDeepQueryArgs, unitFlatQueryArgs, unitNestedQueryArgs } from '../query-args';

export type UnitDeepDbType = Prisma.UnitGetPayload<typeof unitDeepQueryArgs>;

export type UnitNestedDbType = Prisma.UnitGetPayload<typeof unitNestedQueryArgs>;

export type UnitFlatDbType = Prisma.UnitGetPayload<typeof unitFlatQueryArgs>;
