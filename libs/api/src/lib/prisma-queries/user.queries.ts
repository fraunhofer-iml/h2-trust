import { Prisma } from '@prisma/client';
import { companyResultFields } from './company.queries';

// TODO-MP: move to database lib

export const userWithCompanyResultFields = Prisma.validator<Prisma.UserDefaultArgs>()({
  omit: {
    companyId: true,
  },
  include: {
    company: {
      ...companyResultFields,
    },
  },
});
