/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { processStepDeepQueryArgs, processStepFlatQueryArgs, processStepNestedQueryArgs } from '../query-args';

export type ProcessStepDeepDbType = Prisma.ProcessStepGetPayload<typeof processStepDeepQueryArgs>;

export type ProcessStepNestedDbType = Prisma.ProcessStepGetPayload<typeof processStepNestedQueryArgs>;

export type ProcessStepFlatDbType = Prisma.ProcessStepGetPayload<typeof processStepFlatQueryArgs>;
