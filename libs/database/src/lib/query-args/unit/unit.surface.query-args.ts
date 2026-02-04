/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';

export const baseUnitSurfaceQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: true,
    operator: true,
    //hydrogenStorageUnit: true,
  },
});

export const hydrogenStorageUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
    filling: true,
  },
});

export const powerProductionUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
    type: true,
  },
});

export const hydrogenProductionUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
  },
});
