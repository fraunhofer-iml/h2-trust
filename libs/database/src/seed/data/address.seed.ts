/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

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
    street: 'Am Technologiepark 3',
    postalCode: '44227',
    city: 'Dortmund',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    latitude: new Prisma.Decimal(51.444),
    longitude: new Prisma.Decimal(7.454),
  },
  {
    id: 'address-recipient-1',
    street: 'Empfängerstraße 1',
    postalCode: '09876',
    city: 'Empfängerstadt',
    state: 'Empfängerland',
    country: 'Empfängerland',
    latitude: new Prisma.Decimal(34.56789),
    longitude: new Prisma.Decimal(76.54321),
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
  {
    id: 'address-hydrogen-2',
    street: 'Innovationspark 21',
    postalCode: '44142',
    city: 'Dortmund',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    latitude: new Prisma.Decimal(51.520727),
    longitude: new Prisma.Decimal(7.429133),
  },
  {
    id: 'address-power-2',
    street: 'Windweg 12',
    postalCode: '12345',
    city: 'Musterstadt',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    latitude: new Prisma.Decimal(53.512345),
    longitude: new Prisma.Decimal(9.123456),
  },
];
