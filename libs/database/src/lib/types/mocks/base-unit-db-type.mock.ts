/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDeepDbType, BaseUnitFlatDbType, BaseUnitNestedDbType } from '..';
import { AddressSeed, CompanySeed, UnitSeed } from '../../../seed';

export const BaseUnitFlatDbTypeMock: readonly BaseUnitFlatDbType[] = Object.freeze([
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    operator: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
    owner: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
  },
]);

export const BaseUnitNestedDbTypeMock: readonly BaseUnitNestedDbType[] = Object.freeze([
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    operator: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
    owner: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
  },
]);

export const BaseUnitDeepDbTypeMock = <BaseUnitDeepDbType[]>[
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    owner: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
    operator: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenApprovals: [],
      powerApprovals: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
  },
];
