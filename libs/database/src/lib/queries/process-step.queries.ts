import { Prisma } from '@prisma/client';

export const processStepResultFields = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: {
      include: {
        owner: true,
      },
    },
    executedBy: true,
  },
});
