import { Prisma } from '@prisma/client';
import { batchResultFields } from './batch.result-fields';
import { baseUnitResultFields } from './unit.result-fields';

export const processStepResultFields = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchResultFields,
    executedBy: baseUnitResultFields,
    recordedBy: true,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
