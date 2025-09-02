import { Address, Prisma } from '@prisma/client';

export const AddressSeed = <Address[]>[
  {
    id: 'address-power-1',
    street: 'Energieweg 1',
    postalCode: '12345',
    city: 'Energietown',
    state: 'Energieland',
    country: 'Energieland',
    latitude: new Prisma.Decimal(12.345678),
    longitude: new Prisma.Decimal(98.765432),
  },
  {
    id: 'address-hydrogen-1',
    street: 'Wasserstoffstraße 1',
    postalCode: '67890',
    city: 'Wasserstadt',
    state: 'Wasserland',
    country: 'Wasserland',
    latitude: new Prisma.Decimal(23.456789),
    longitude: new Prisma.Decimal(87.654321),
  },
  {
    id: 'address-recipient-1',
    street: 'Empfängerstraße 1',
    postalCode: '09876',
    city: 'Empfängerstadt',
    state: 'Empfängerland',
    country: 'Empfängerland',
    latitude: new Prisma.Decimal(34.567890),
    longitude: new Prisma.Decimal(76.543210),
  },
  {
    id: 'address-grid-1',
    street: 'Stromnetzstraße 1',
    postalCode: '11111',
    city: 'Netzstadt',
    state: 'Netzland',
    country: 'Netzland',
    latitude: new Prisma.Decimal(45.678901),
    longitude: new Prisma.Decimal(65.432109),
  },
];
