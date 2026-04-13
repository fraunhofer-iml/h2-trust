/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchFlatQueryArgs } from '../batch/batch.flat.query-args';
import { companyNestedQueryArgs } from '../company/company.nested.query-args';
import { baseUnitNestedQueryArgs } from './unit.nested.query-args';

export const hydrogenProductionUnitDeepQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
  },
});

export const hydrogenStorageUnitDeepQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
    filling: activeBatchFlatQueryArgs,
  },
});

export const powerProductionUnitDeepQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitNestedQueryArgs,
    type: true,
  },
});

export const baseUnitDeepQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companyNestedQueryArgs,
    operator: companyNestedQueryArgs,
    hydrogenProductionUnit: true,
    powerProductionUnit: powerProductionUnitDeepQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitDeepQueryArgs,
  },
});
