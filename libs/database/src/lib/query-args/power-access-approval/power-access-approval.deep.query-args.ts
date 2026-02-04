/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyShallowQueryArgs } from '../company/company.shallow.query-args';
import { powerProductionUnitRefShallowQueryArgs } from '../unit/unit.shallow.query-args';

export const powerAccessApprovalDeepQueryArgs = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    document: true,
    powerProducer: companyShallowQueryArgs,
    hydrogenProducer: companyShallowQueryArgs,
    powerProductionUnit: powerProductionUnitRefShallowQueryArgs,
  },
});
