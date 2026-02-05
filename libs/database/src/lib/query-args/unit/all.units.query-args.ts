/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchFlatQueryArgs } from '../batch/batch.flat.query-args';
import { baseUnitDeepQueryArgs } from './unit.deep.query-args';

const powerProductionUnitChildQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    type: true,
  },
});

const hydrogenStorageUnitChildQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    filling: activeBatchFlatQueryArgs,
  },
});

//TODO-LG: Replace with a deep, nested or flat function if possible
export const allUnitsQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
    hydrogenProductionUnit: true,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});

//TODO-LG: Replace with a deep, nested or flat function if possible
export const powerProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
  },
});

//TODO-LG: Replace with a deep, nested or flat function if possible
export const hydrogenProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    hydrogenProductionUnit: true,
  },
});

//TODO-LG: Replace with a deep, nested or flat function if possible
export const hydrogenStorageUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});
