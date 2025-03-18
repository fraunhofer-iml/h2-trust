import { Address } from '@prisma/client';

export const Addresses = <Address[]>[
  {
    id: 'address-power-1',
    street: 'Energieweg 1',
    postalCode: '12345',
    city: 'Energietown',
    state: 'Energieland',
    country: 'Energieland',
  },
  {
    id: 'address-hydrogen-1',
    street: 'Wasserstoffstraße 1',
    postalCode: '67890',
    city: 'Wasserstadt',
    state: 'Wasserland',
    country: 'Wasserland',
  },
];
