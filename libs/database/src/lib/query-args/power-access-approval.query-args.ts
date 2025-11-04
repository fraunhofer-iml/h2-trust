/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyQueryArgs } from './company.query.args';
import { baseUnitQueryArgs } from './unit.query-args';

export const powerAccessApprovalQueryArgs = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    powerProducer: companyQueryArgs,
    hydrogenProducer: companyQueryArgs,
    document: true,
    powerProductionUnit: {
      include: {
        generalInfo: {
          ...baseUnitQueryArgs,
        },
        type: true,
      },
    },
  },
});
