import { Prisma } from '@prisma/client';

// TODO-MP: move to database lib

export const addressResultFields = Prisma.validator<Prisma.AddressDefaultArgs>()({
  omit: {
    id: true,
  },
});
