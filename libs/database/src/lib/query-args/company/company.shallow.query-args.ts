/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { powerAccessApprovalSurfaceQueryArgs } from '../power-access-approval/power-access-approval.surface.query-args';

export const companyShallowQueryArgs = Prisma.validator<Prisma.CompanyDefaultArgs>()({
  include: {
    address: true,
    hydrogenApprovals: powerAccessApprovalSurfaceQueryArgs,
    powerApprovals: powerAccessApprovalSurfaceQueryArgs,
    unitOwners: true,
    unitOperators: true,
    users: true,
    batches: true,
  },
});
