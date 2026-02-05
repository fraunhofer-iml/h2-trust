/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchDeepQueryArgs, batchFlatQueryArgs, batchNestedQueryArgs } from '../query-args';

export type BatchDeepDbType = Prisma.BatchGetPayload<typeof batchDeepQueryArgs>;

export type BatchNestedDbType = Prisma.BatchGetPayload<typeof batchNestedQueryArgs>;

export type BatchFlatDbType = Prisma.BatchGetPayload<typeof batchFlatQueryArgs>;
