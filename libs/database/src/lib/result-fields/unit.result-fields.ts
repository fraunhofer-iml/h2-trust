import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.result-fields';

export const baseUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: {
      include: {
        ...companyResultFields.include,
        hydrogenApprovals: {
          include: {
            powerProducer: true,
          },
        },
      },
    },
  },
});

const powerProductionUnitChildResultFields = Prisma.validator<Prisma.PowerProductionUnitDefaultArgs>()({
  include: {
    type: true,
  },
});

const hydrogenProductionUnitChildResultFields = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    hydrogenStorageUnit: {
      include: {
        generalInfo: true,
      },
    },
    type: true,
  },
});

const hydrogenStorageUnitChildResultFields = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    filling: {
      where: {
        active: true,
      },
    },
    hydrogenProductionUnits: {
      include: {
        generalInfo: true,
      },
    },
  },
});

export const allUnitsResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitResultFields,
  include: {
    ...baseUnitResultFields.include,
    powerProductionUnit: powerProductionUnitChildResultFields,
    hydrogenProductionUnit: hydrogenProductionUnitChildResultFields,
    hydrogenStorageUnit: hydrogenStorageUnitChildResultFields,
  },
});

export const powerProductionUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitResultFields,
  include: {
    ...baseUnitResultFields.include,
    powerProductionUnit: powerProductionUnitChildResultFields,
  },
});

export const hydrogenProductionUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitResultFields,
  include: {
    ...baseUnitResultFields.include,
    hydrogenProductionUnit: hydrogenProductionUnitChildResultFields,
  },
});

export const hydrogenStorageUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitResultFields,
  include: {
    ...baseUnitResultFields.include,
    hydrogenStorageUnit: hydrogenStorageUnitChildResultFields,
  },
});
