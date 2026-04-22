/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDeepDbType, CompanyNestedDbType } from '..';
import { AddressSeed, CompanySeed } from '../../../seed';

export const CompanyNestedDbTypeMock = <CompanyNestedDbType[]>[
  {
    ...CompanySeed[0],
    address: AddressSeed[0],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[1],
    address: AddressSeed[1],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[2],
    address: AddressSeed[2],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[3],
    address: AddressSeed[3],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
];

export const CompanyDbTypeMock = <CompanyDeepDbType[]>[
  {
    ...CompanySeed[0],
    address: AddressSeed[0],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[1],
    address: AddressSeed[1],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[2],
    address: AddressSeed[2],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[3],
    address: AddressSeed[3],
    hydrogenAgreements: [],
    powerAgreements: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
];
