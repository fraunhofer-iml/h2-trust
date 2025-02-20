import { Company, CompanyType } from '@prisma/client';

export const Companies = <Company[]>[
  {
    id: 'company-power',
    name: 'PowerGen AG',
    legalForm: 'AG',
    mastrNumber: 'P12345',
    companyType: CompanyType.POWER_PRODUCER,
    addressId: 'address-power',
  },
  {
    id: 'company-hydrogen',
    name: 'HydroGen GmbH',
    legalForm: 'GmbH',
    mastrNumber: 'H67890',
    companyType: CompanyType.HYDROGEN_PRODUCER,
    addressId: 'address-hydrogen',
  },
];
