import { Company, CompanyType } from '@prisma/client';
import { AddressSeed } from './addresses.seed';
import { getElementOrThrowError } from './utils';

export const CompaniesSeed = <Company[]>[
  {
    id: 'company-power-1',
    name: 'PowerGen AG',
    mastrNumber: 'P12345',
    companyType: CompanyType.POWER_PRODUCER,
    addressId: getElementOrThrowError(AddressSeed, 0, 'Address').id,
  },
  {
    id: 'company-hydrogen-1',
    name: 'HydroGen GmbH',
    mastrNumber: 'H67890',
    companyType: CompanyType.HYDROGEN_PRODUCER,
    addressId: getElementOrThrowError(AddressSeed, 1, 'Address').id,
  },
  {
    id: 'company-recipient-1',
    name: 'H2Logistics',
    mastrNumber: 'R112233',
    companyType: CompanyType.HYDROGEN_RECIPIENT,
    addressId: getElementOrThrowError(AddressSeed, 1, 'Address').id,
  },
];
