import { Prisma } from '@prisma/client';
import { batchResultFields } from './batch.queries';
import { baseUnitResultFields } from './unit.queries';

export const processStepResultFields = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchResultFields,
    executedBy: baseUnitResultFields,
    recordedBy: true,
    documents: true,
  },
});
