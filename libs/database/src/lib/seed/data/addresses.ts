import { Address } from '@prisma/client';

export const Addresses = <Address[]>[
  {
    id: 'address-power',
    street: 'Energieweg 1',
    postalCode: '12345',
    city: 'Energietown',
    state: 'Energieland',
    country: 'Energieland',
  },
  {
    id: 'address-hydrogen',
    street: 'Wasserstoffstraße 1',
    postalCode: '67890',
    city: 'Wasserstadt',
    state: 'Wasserland',
    country: 'Wasserland',
  },
];
