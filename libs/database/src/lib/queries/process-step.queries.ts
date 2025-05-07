import { Prisma } from '@prisma/client';
import { batchResultFields } from './batch.queries';

export const processStepResultFields = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchResultFields,
    executedBy: true,
    documents: true,
  },
});
