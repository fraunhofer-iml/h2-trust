import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.result-fields';

export const batchResultFields = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyResultFields,
    predecessors: {
      include: {
        owner: companyResultFields,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true
          },
        },
      },
    },
    successors: {
      include: {
        owner: companyResultFields,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true
          },
        },
      },
    },
    hydrogenStorageUnit: {
      include: {
        generalInfo: true
      },
    },
  },
});
