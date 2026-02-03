/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchDeepQueryArgs, batchShallowQueryArgs, batchSurfaceQueryArgs } from '../query-args';

export type BatchDeepDbType = Prisma.BatchGetPayload<typeof batchDeepQueryArgs>;

export type BatchShallowDbType = Prisma.BatchGetPayload<typeof batchShallowQueryArgs>;

export type BatchSurfaceDbType = Prisma.BatchGetPayload<typeof batchSurfaceQueryArgs>;
