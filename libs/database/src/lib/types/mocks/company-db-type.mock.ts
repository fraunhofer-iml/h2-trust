/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDbShallowType, CompanyDbSurfaceType, CompanyDeepDbType } from '..';
import { AddressSeed, CompanySeed } from '../../../seed';

export const CompanySurfaceDbTypeMock: readonly CompanyDbSurfaceType[] = Object.freeze([
  {
    ...CompanySeed[0],
    address: AddressSeed[0],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[1],
    address: AddressSeed[1],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[2],
    address: AddressSeed[2],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[3],
    address: AddressSeed[3],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
]);

export const CompanyShallowDbTypeMock = <CompanyDbShallowType[]>[
  {
    ...CompanySeed[0],
    address: AddressSeed[0],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[1],
    address: AddressSeed[1],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[2],
    address: AddressSeed[2],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[3],
    address: AddressSeed[3],
    hydrogenApprovals: [],
    powerApprovals: [],
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
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[1],
    address: AddressSeed[1],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[2],
    address: AddressSeed[2],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
  {
    ...CompanySeed[3],
    address: AddressSeed[3],
    hydrogenApprovals: [],
    powerApprovals: [],
    unitOwners: [],
    unitOperators: [],
    users: [],
    batches: [],
  },
];
