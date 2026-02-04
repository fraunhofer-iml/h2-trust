/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchShallowQueryArgs } from '../batch/batch.surface.query-args';
import { companyShallowQueryArgs } from '../company/company.shallow.query-args';

export const baseUnitDeepQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companyShallowQueryArgs,
    operator: companyShallowQueryArgs,
  },
});

export const hydrogenStorageUnitDeepQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
    filling: activeBatchShallowQueryArgs,
  },
});

export const powerProductionUnitDeepQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
    type: true,
  },
});

export const hydrogenProductionUnitDeepQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
  },
});
