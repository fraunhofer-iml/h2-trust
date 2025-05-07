import { Company, CompanyType } from '@prisma/client';

export const Companies = <Company[]>[
  {
    id: 'company-power-1',
    name: 'PowerGen AG',
    mastrNumber: 'P12345',
    companyType: CompanyType.POWER_PRODUCER,
    addressId: 'address-power-1',
  },
  {
    id: 'company-hydrogen-1',
    name: 'HydroGen GmbH',
    mastrNumber: 'H67890',
    companyType: CompanyType.HYDROGEN_PRODUCER,
    addressId: 'address-hydrogen-1',
  },
  {
    id: 'company-recipient-1',
    name: 'H2Logistics',
    mastrNumber: 'R112233',
    companyType: CompanyType.HYDROGEN_RECIPIENT,
    addressId: 'address-hydrogen-1',
  },
];
