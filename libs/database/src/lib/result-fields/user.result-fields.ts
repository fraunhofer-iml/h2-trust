import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.result-fields';

export const userWithCompanyResultFields = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    company: {
      ...companyResultFields,
    },
  },
});
