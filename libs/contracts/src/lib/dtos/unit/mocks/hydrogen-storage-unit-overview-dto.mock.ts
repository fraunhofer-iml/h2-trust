/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageOverviewDto } from '@h2-trust/contracts/dtos';

export const HydrogenStorageUnitOverviewDtoMock = <HydrogenStorageOverviewDto[]>[
  {
    id: 'storage-1',
    name: 'Storage Unit 1',
    capacity: 1000,
    filling: 750,
    hydrogenComposition: [{ amount: 80 }, { amount: 20 }],
  },
  {
    id: 'storage-2',
    name: 'Storage Unit 2',
    capacity: 2000,
    filling: 1500,
    hydrogenComposition: [{ amount: 100 }],
  },
];
