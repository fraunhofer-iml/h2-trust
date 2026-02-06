/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchFlatQueryArgs } from '../batch/batch.flat.query-args';
import { companyFlatQueryArgs } from '../company/company.flat.query-args';

export const baseUnitNestedQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companyFlatQueryArgs,
    operator: companyFlatQueryArgs,
  },
});

export const hydrogenStorageUnitNestedQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
    filling: activeBatchFlatQueryArgs,
  },
});

export const powerProductionUnitNestedQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
    type: true,
  },
});

export const hydrogenProductionUnitNestedQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
  },
});
