/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSeed } from '../../../seed';
import { UserDbType } from '../user.db.type';
import { CompanyDbTypeMock } from './company-db-type.mock';

export const UserDbTypeMock = <UserDbType[]>[
  {
    ...UserSeed[0],
    company: CompanyDbTypeMock[0],
  },
  {
    ...UserSeed[1],
    company: CompanyDbTypeMock[2],
  },
  {
    ...UserSeed[2],
    company: CompanyDbTypeMock[2],
  },
];
