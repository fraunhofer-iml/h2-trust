/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { activeBatchShallowQueryArgs } from './batch.query-args';
import { companyShallowQueryArgs, companySurfaceQueryArgs } from './company.query.args';

export const baseUnitDeepQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companyShallowQueryArgs,
    operator: companyShallowQueryArgs,
    //hydrogenStorageUnit: true,
  },
});

export const baseUnitShallowQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companySurfaceQueryArgs,
    operator: companySurfaceQueryArgs,
    //hydrogenStorageUnit: true,
  },
});

export const baseUnitSurfaceQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: true,
    operator: true,
    //hydrogenStorageUnit: true,
  },
});

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

export const hydrogenStorageUnitRefDeepQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
    filling: activeBatchShallowQueryArgs,
  },
});

export const hydrogenStorageUnitRefShallowQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
    filling: activeBatchShallowQueryArgs,
  },
});

export const hydrogenStorageUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
    filling: true,
  },
});

export const powerProductionUnitRefDeepQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
    type: true,
  },
});

export const powerProductionUnitRefShallowQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
    type: true,
  },
});

export const powerProductionUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
    type: true,
  },
});

export const hydrogenProductionUnitRefDeepQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitDeepQueryArgs,
  },
});

export const hydrogenProductionUnitRefShallowQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitShallowQueryArgs,
  },
});

export const hydrogenProductionUnitRefSurfaceQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    generalInfo: baseUnitSurfaceQueryArgs,
  },
});
