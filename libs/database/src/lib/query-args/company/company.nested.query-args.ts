/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { powerAccessApprovalFlatQueryArgs } from '../power-access-approval/power-access-approval.flat.query-args';

export const companyNestedQueryArgs = Prisma.validator<Prisma.CompanyDefaultArgs>()({
  include: {
    address: true,
    hydrogenApprovals: powerAccessApprovalFlatQueryArgs,
    powerApprovals: powerAccessApprovalFlatQueryArgs,
    unitOwners: true,
    unitOperators: true,
    users: true,
    batches: true,
  },
});
