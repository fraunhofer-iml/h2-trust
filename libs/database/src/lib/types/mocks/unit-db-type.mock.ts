/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType } from '..';
import { AddressSeed, CompanySeed, UnitDetailsSeed, UnitSeed } from '../../../seed';

export const UnitDeepDbTypeMock = <UnitDeepDbType[]>[
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    owner: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenAgreements: [],
      powerAgreements: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
    operator: {
      ...CompanySeed[0],
      address: AddressSeed[0],
      hydrogenAgreements: [],
      powerAgreements: [],
      unitOwners: [],
      unitOperators: [],
      users: [],
      batches: [],
    },
    details: UnitDetailsSeed[0],
    decisions: [],
    powerPurchaseAgreements: [],
    stagedProductions: [],
    documents: [],
    processSteps: [],
  },
];
