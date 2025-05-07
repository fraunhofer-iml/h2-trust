import { Prisma } from '@prisma/client';

export const baseUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    company: {
      include: {
        hydrogenApprovals: {
          include: {
            powerProducer: true,
          },
        },
      },
    },
  },
});

const hydrogenProductionUnitChildResultFields = Prisma.validator<Prisma.HydrogenProductionUnitDefaultArgs>()({
  include: {
    hydrogenStorageUnit: {
      include: {
        generalInfo: true,
      },
    },
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
    powerProductionUnit: true,
    hydrogenProductionUnit: hydrogenProductionUnitChildResultFields,
    hydrogenStorageUnit: hydrogenStorageUnitChildResultFields,
  },
});

export const powerProductionUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...baseUnitResultFields,
  include: {
    ...baseUnitResultFields.include,
    powerProductionUnit: true,
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
