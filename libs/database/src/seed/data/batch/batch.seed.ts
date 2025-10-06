/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch } from '@prisma/client';
import { BatchHydrogenBottledSeed } from './batch-hydrogen-bottled.seed';
import { BatchHydrogenProducedSeed } from './batch-hydrogen-produced.seed';
import { BatchHydrogenTransportedSeed } from './batch-hydrogen-transported.seed';
import { BatchPowerProducedSeed } from './batch-power-produced.seed';

export const BatchSeed = <Batch[]>[
  ...BatchPowerProducedSeed,
  ...BatchHydrogenBottledSeed,
  ...BatchHydrogenProducedSeed,
  ...BatchHydrogenTransportedSeed,
];
