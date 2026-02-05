/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  powerAccessApprovalDeepQueryArgs,
  powerAccessApprovalFlatQueryArgs,
  powerAccessApprovalNestedQueryArgs,
} from '../query-args';

export type PowerAccessApprovalDeepDbType = Prisma.PowerAccessApprovalGetPayload<
  typeof powerAccessApprovalDeepQueryArgs
>;

export type PowerAccessApprovalNestedDbType = Prisma.PowerAccessApprovalGetPayload<
  typeof powerAccessApprovalNestedQueryArgs
>;

export type PowerAccessApprovalFlatDbType = Prisma.PowerAccessApprovalGetPayload<
  typeof powerAccessApprovalFlatQueryArgs
>;
