/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  stagedProductionDeepQueryArgs,
  stagedProductionFlatQueryArgs,
  stagedProductionNestedQueryArgs,
} from '../query-args';

export type StagedProductionDeepDbType = Prisma.StagedProductionGetPayload<typeof stagedProductionDeepQueryArgs>;
export type StagedProductionNestedDbType = Prisma.StagedProductionGetPayload<typeof stagedProductionNestedQueryArgs>;
export type StagedProductionFlatDbType = Prisma.StagedProductionGetPayload<typeof stagedProductionFlatQueryArgs>;
