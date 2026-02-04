/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchShallowQueryArgs } from '../batch/batch.surface.query-args';
import { baseUnitDeepQueryArgs } from './unit.deep.query-args';

const powerProductionUnitChildQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    type: true,
  },
});

const hydrogenStorageUnitChildQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    filling: activeBatchShallowQueryArgs,
  },
});

//TODO-LG: is it possible to remove this query and replace it with one of the ref variants
export const allUnitsQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
    hydrogenProductionUnit: true,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});

//TODO-LG: is it possible to remove this query and replace it with one of the ref variants
export const powerProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
  },
});

//TODO-LG: is it possible to remove this query and replace it with one of the ref variants
export const hydrogenProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    hydrogenProductionUnit: true,
  },
});

//TODO-LG: is it possible to remove this query and replace it with one of the ref variants
export const hydrogenStorageUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitDeepQueryArgs,
  include: {
    ...baseUnitDeepQueryArgs.include,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});
