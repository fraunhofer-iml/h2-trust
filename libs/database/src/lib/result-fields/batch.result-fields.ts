/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.result-fields';

export const batchResultFields = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyResultFields,
    predecessors: {
      include: {
        owner: companyResultFields,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true,
          },
        },
        processStep: true,
      },
    },
    successors: {
      include: {
        owner: companyResultFields,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true,
          },
        },
        processStep: true,
      },
    },
    hydrogenStorageUnit: {
      include: {
        generalInfo: true,
      },
    },
    processStep: true,
  },
});
