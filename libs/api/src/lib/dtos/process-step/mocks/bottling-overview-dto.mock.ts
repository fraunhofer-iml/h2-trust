/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottlingOverviewDto } from '../bottling-overview.dto';

export const BottlingOverviewDtoMock = <BottlingOverviewDto[]>[
  <BottlingOverviewDto>{
    id: 'bottling-batch-1',
    filledAt: new Date('2025-04-07T08:48:00.000Z'),
    filledAmount: 100,
    owner: 'company-hydrogen-1',
    color: 'GREEN',
  },
];
