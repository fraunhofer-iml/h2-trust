import { Prisma } from '@prisma/client';
import { addressResultFields } from './address.queries';

// TODO-MP: move to database lib

export const fillingBatchResultFields = Prisma.validator<Prisma.BatchDefaultArgs>()({
  omit: {
    active: true,
    type: true,
    ownerId: true,
    hydrogenStorageUnitId: true,
  },
});

export const unitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  omit: {
    addressId: true,
  },
  include: {
    address: addressResultFields,
  },
});

export const hydrogenStorageUnitChildResultFields = Prisma.validator<Prisma.HydrogenStorageUnitDefaultArgs>()({
  include: {
    filling: {
      where: {
        active: true,
      },
      ...fillingBatchResultFields,
    },
  },
});

export const unitUnionResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    powerProductionUnit: true,
    hydrogenProductionUnit: true,
    hydrogenStorageUnit: hydrogenStorageUnitChildResultFields,
  },
});

export const powerProductionUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    powerProductionUnit: true,
  },
});

export const hydrogenProductionUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    hydrogenProductionUnit: true,
  },
});

export const hydrogenStorageUnitResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    hydrogenStorageUnit: hydrogenStorageUnitChildResultFields,
  },
});

export const hydrogenProductionOverviewResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    hydrogenProductionUnit: {
      include: {
        hydrogenStorageUnit: {
          select: {
            id: true,
            generalInfo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
    company: {
      select: {
        hydrogenApprovals: {
          select: {
            powerAccessApprovalStatus: true,
            powerProducerId: true,
          },
        },
      },
    },
  },
});

export const hydrogenStorageOverviewResultFields = Prisma.validator<Prisma.UnitDefaultArgs>()({
  ...unitResultFields,
  include: {
    ...unitResultFields.include,
    hydrogenStorageUnit: {
      include: {
        ...hydrogenStorageUnitChildResultFields.include,
        hydrogenProductionUnits: {
          select: {
            id: true,
            hydrogenStorageUnitId: true,
            generalInfo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
  },
});
