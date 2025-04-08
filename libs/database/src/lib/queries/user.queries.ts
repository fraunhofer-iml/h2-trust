import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.queries';

export const userWithCompanyResultFields = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    company: {
      ...companyResultFields,
    },
  },
});
