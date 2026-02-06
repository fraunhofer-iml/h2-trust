/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { baseUnitDeepQueryArgs, baseUnitFlatQueryArgs, baseUnitNestedQueryArgs } from '../query-args';

export type BaseUnitDeepDbType = Prisma.UnitGetPayload<typeof baseUnitDeepQueryArgs>;

export type BaseUnitNestedDbType = Prisma.UnitGetPayload<typeof baseUnitNestedQueryArgs>;

export type BaseUnitFlatDbType = Prisma.UnitGetPayload<typeof baseUnitFlatQueryArgs>;
