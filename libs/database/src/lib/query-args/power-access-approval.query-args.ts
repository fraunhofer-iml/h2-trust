/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyShallowQueryArgs } from './company.query.args';
import { companySurfaceQueryArgs } from './company.query.surface.args';
import { powerProductionUnitRefShallowQueryArgs, powerProductionUnitRefSurfaceQueryArgs } from './unit.query-args';

export const powerAccessApprovalDeepQueryArgs = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    document: true,
    powerProducer: companyShallowQueryArgs,
    hydrogenProducer: companyShallowQueryArgs,
    powerProductionUnit: powerProductionUnitRefShallowQueryArgs,
  },
});

export const powerAccessApprovalShallowQueryArgs = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    document: true,
    powerProducer: companySurfaceQueryArgs,
    hydrogenProducer: companySurfaceQueryArgs,
    powerProductionUnit: powerProductionUnitRefSurfaceQueryArgs,
  },
});

export const powerAccessApprovalSurfaceQueryArgs = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    document: true,
    hydrogenProducer: true,
    powerProducer: true,
    powerProductionUnit: true,
  },
});
