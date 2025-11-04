/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '@prisma/client';
import { CompanySeed } from './company.seed';

export const UserSeed = <User[]>[
  {
    id: 'user-power-0',
    name: 'Petra Power',
    email: 'petra@power.de',
    companyId: CompanySeed[0].id,
  },
  {
    id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    name: 'Emil Hydrogen',
    email: 'emil@hydrogen.de',
    companyId: CompanySeed[2].id,
  },
  {
    id: 'f2872c58-ff19-4079-ad53-e04cd95b5a4a',
    name: 'Erika Hydrogen',
    email: 'erika@hydrogen.de',
    companyId: CompanySeed[2].id,
  },
];
