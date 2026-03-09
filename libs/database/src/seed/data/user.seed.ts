/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '@prisma/client';
import { CompanySeed } from './company.seed';

export const UserSeed: readonly User[] = Object.freeze([
  {
    id: '5ee626b0-0b41-4986-bfe9-65cfd064d0a1',
    name: 'Petra Power',
    email: 'petra@h2-trust.de',
    companyId: CompanySeed[0].id,
  },
  {
    id: 'e341b634-8f14-466a-8ae9-de41d07ce707',
    name: 'Hannes Hydrogen',
    email: 'hannes@h2-trust.de',
    companyId: CompanySeed[2].id,
  },
]);
