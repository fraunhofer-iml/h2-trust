import { Prisma } from '@prisma/client';
import { addressResultFields } from './address.queries';

// TODO-MP: move to database lib

export const companyResultFields = Prisma.validator<Prisma.CompanyDefaultArgs>()({
  omit: {
    addressId: true,
  },
  include: {
    address: addressResultFields,
  },
});
