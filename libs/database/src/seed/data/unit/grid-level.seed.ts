/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridLevel } from '@prisma/client';

export const GridLevelSeed = <GridLevel[]>[
  {
    name: 'EXTRA_HIGH_VOLTAGE',
  },
  {
    name: 'HIGH_VOLTAGE',
  },
  {
    name: 'MEDIUM_VOLTAGE',
  },
  {
    name: 'LOW_VOLTAGE',
  },
];
