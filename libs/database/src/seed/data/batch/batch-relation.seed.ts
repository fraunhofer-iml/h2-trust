/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchHydrogenBottledSeed } from './batch-hydrogen-bottled.seed';
import { BatchHydrogenProducedSeed } from './batch-hydrogen-produced.seed';
import { BatchPowerProducedSeed } from './batch-power-produced.seed';

export const BatchRelationPowerHydrogenSeed = BatchHydrogenProducedSeed.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: BatchPowerProducedSeed[index].id,
}));

export const BatchRelationHydrogenHydrogenSeed = [
  {
    A: BatchHydrogenBottledSeed[0].id,
    B: BatchHydrogenProducedSeed[0].id,
  },
  {
    A: BatchHydrogenBottledSeed[1].id,
    B: BatchHydrogenProducedSeed[1].id,
  },
  {
    A: BatchHydrogenBottledSeed[1].id,
    B: BatchHydrogenProducedSeed[2].id,
  },
  {
    A: BatchHydrogenBottledSeed[2].id,
    B: BatchHydrogenProducedSeed[3].id,
  },
];
