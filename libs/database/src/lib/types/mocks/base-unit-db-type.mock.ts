/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDbType } from '..';
import { AddressSeed, CompanySeed, PowerAccessApprovalSeed, UnitSeed } from '../../../seed';

export const BaseUnitDbTypeMock = <BaseUnitDbType[]>[
  {
    ...UnitSeed[0],
    address: AddressSeed[0],
    owner: {
      ...CompanySeed[0],
      hydrogenApprovals: PowerAccessApprovalSeed.map((approval) => ({
        ...approval,
        powerProducer: CompanySeed[0],
      })),
    },
  },
];
