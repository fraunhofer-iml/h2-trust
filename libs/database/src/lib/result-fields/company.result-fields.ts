import { Prisma } from '@prisma/client';

export const companyResultFields = Prisma.validator<Prisma.CompanyDefaultArgs>()({
  include: {
    address: true,
  },
});
