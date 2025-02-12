/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from '@prisma/client';
import { Data, importData } from './data-importer';

import { Addresses } from './data/addresses';
import { Companies } from './data/companies';
import { Users } from './data/users';

const data: Data[] = [
  {
    name: 'address',
    records: Addresses,
    createRecord: async (data: any) => await prisma.address.create({ data }),
  },
  {
    name: 'company',
    records: Companies,
    createRecord: async (data: any) => await prisma.company.create({ data }),
  },
  {
    name: 'user',
    records: Users,
    createRecord: async (data: any) => await prisma.user.create({ data }),
  },
];

const prisma = new PrismaClient();

importData(data)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('### Error during data import:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
