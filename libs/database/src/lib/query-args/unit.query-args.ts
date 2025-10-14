/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyQueryArgs } from './company.query.args';

export const baseUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: {
      include: {
        ...companyQueryArgs.include,
        hydrogenApprovals: {
          include: {
            powerProducer: true,
          },
        },
      },
    },
    operator: {
      include: {
        ...companyQueryArgs.include,
      },
    },
  },
});

const powerProductionUnitChildQueryArgs = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    type: true,
  },
});

const hydrogenProductionUnitChildQueryArgs = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    type: true,
  },
});

const hydrogenStorageUnitChildQueryArgs = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    filling: {
      where: {
        active: true,
      },
    },
  },
});

export const allUnitsQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitQueryArgs,
  include: {
    ...baseUnitQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
    hydrogenProductionUnit: hydrogenProductionUnitChildQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});

export const powerProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitQueryArgs,
  include: {
    ...baseUnitQueryArgs.include,
    powerProductionUnit: powerProductionUnitChildQueryArgs,
  },
});

export const hydrogenProductionUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitQueryArgs,
  include: {
    ...baseUnitQueryArgs.include,
    hydrogenProductionUnit: hydrogenProductionUnitChildQueryArgs,
  },
});

export const hydrogenStorageUnitQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitQueryArgs,
  include: {
    ...baseUnitQueryArgs.include,
    hydrogenStorageUnit: hydrogenStorageUnitChildQueryArgs,
  },
});
