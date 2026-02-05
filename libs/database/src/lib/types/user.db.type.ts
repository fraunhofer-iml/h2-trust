/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { userDeepQueryArgs, userFlatQueryArgs, userNestedQueryArgs } from '../query-args';

export type UserDeepDbType = Prisma.UserGetPayload<typeof userDeepQueryArgs>;

export type UserNestedDbType = Prisma.UserGetPayload<typeof userNestedQueryArgs>;

export type UserFlatDbType = Prisma.UserGetPayload<typeof userFlatQueryArgs>;
