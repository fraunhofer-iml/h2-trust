import { Address } from '@prisma/client';

export const AddressSeed = <Address[]>[
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
  {
    id: 'address-recipient-1',
    street: 'Empfängerstraße 1',
    postalCode: '09876',
    city: 'Empfängerstadt',
    state: 'Empfängerland',
    country: 'Empfängerland',
  },
  {
    id: 'address-grid-1',
    street: 'Stromnetzstraße 1',
    postalCode: '11111',
    city: 'Netzstadt',
    state: 'Netzland',
    country: 'Netzland',
  },
];
