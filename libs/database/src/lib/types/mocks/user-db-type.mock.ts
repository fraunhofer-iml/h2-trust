/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDbType } from '..';
import { CompanySeed, UserSeed } from '../../../seed';

export const UserDbTypeMock = <UserDbType[]>[
  {
    ...UserSeed[0],
    company: CompanySeed[0],
  },
  {
    ...UserSeed[1],
    company: CompanySeed[2],
  },
  {
    ...UserSeed[2],
    company: CompanySeed[2],
  },
];
