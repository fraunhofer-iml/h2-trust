/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchShallowQueryArgs } from '../batch/batch.surface.query-args';
import { companySurfaceQueryArgs } from '../company/company.surface.query-args';

export const baseUnitShallowQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companySurfaceQueryArgs,
    operator: companySurfaceQueryArgs,
  },
});

export const hydrogenStorageUnitShallowQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
    filling: activeBatchShallowQueryArgs,
  },
});

export const powerProductionUnitShallowQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
    type: true,
  },
});

export const hydrogenProductionUnitShallowQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
  },
});
