/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';

export const hydrogenProductionUnitFlatQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: true,
  },
});

export const hydrogenStorageUnitFlatQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: true,
    filling: true,
  },
});

export const powerProductionUnitFlatQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: true,
    type: true,
  },
});

export const baseUnitFlatQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: true,
    operator: true,
    hydrogenProductionUnit: true,
    powerProductionUnit: powerProductionUnitFlatQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitFlatQueryArgs,
  },
});
