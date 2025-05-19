import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.queries';

export const batchResultFields = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyResultFields,
    predecessors: {
      include: {
        owner: companyResultFields,
      },
    },
    successors: {
      include: {
        owner: companyResultFields,
      },
    },
  },
});
