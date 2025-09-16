/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { baseUnitResultFields } from './unit.result-fields';

export const powerAccessApprovalResultFields = Prisma.validator<Prisma.PowerAccessApprovalDefaultArgs>()({
  include: {
    powerProducer: {
      include: {
        address: true,
      },
    },
    hydrogenProducer: true,
    document: true,
    powerProductionUnit: {
      include: {
        generalInfo: {
          ...baseUnitResultFields,
        },
        type: true,
      },
    },
  },
});
