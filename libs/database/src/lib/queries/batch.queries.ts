import { Prisma } from '@prisma/client';

export const batchResultFields = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: true,
  },
});
