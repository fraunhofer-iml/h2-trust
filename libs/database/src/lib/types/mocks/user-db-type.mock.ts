/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSeed } from '../../../seed';
import { UserDeepDbType, UserFlatDbType, UserNestedDbType } from '../user.db.type';
import { CompanyDbTypeMock, CompanyNestedDbTypeMock } from './company-db-type.mock';

export const UserFlatDbTypeMock = <UserFlatDbType[]>[
  {
    ...UserSeed[0],
  },
  {
    ...UserSeed[1],
  },
  {
    ...UserSeed[2],
  },
];

export const UserNestedDbTypeMock = <UserNestedDbType[]>[
  {
    ...UserSeed[0],
    company: CompanyNestedDbTypeMock[0],
  },
  {
    ...UserSeed[1],
    company: CompanyNestedDbTypeMock[2],
  },
  {
    ...UserSeed[2],
    company: CompanyNestedDbTypeMock[2],
  },
];

export const UserDeepDbTypeMock = <UserDeepDbType[]>[
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
