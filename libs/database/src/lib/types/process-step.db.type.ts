/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { processStepDeepQueryArgs, processStepShallowQueryArgs, processStepSurfaceQueryArgs } from '../query-args';

export type ProcessStepDeepDbType = Prisma.ProcessStepGetPayload<typeof processStepDeepQueryArgs>;

export type ProcessStepShallowDbType = Prisma.ProcessStepGetPayload<typeof processStepShallowQueryArgs>;

export type ProcessStepSurfaceDbType = Prisma.ProcessStepGetPayload<typeof processStepSurfaceQueryArgs>;
