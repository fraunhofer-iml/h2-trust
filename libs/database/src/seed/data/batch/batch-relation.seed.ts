/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenBottlingBatchSeed } from './hydrogen-bottling-batch.seed';
import { HydrogenProductionBatchSeed } from './hydrogen-production-batch.seed';
import { HydrogenTransportationBatchSeed } from './hydrogen-transportation-batch.seed';
import { PowerProductionBatchSeed } from './power-production-batch.seed';
import { WaterConsumptionBatchSeed } from './water-consumption-batch.seed';

export const BatchRelationPowerHydrogenSeed = HydrogenProductionBatchSeed.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: PowerProductionBatchSeed[index].id,
}));

export const BatchRelationWaterHydrogenSeed = HydrogenProductionBatchSeed.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: WaterConsumptionBatchSeed[index].id,
}));

export const BatchRelationBottlingProductionSeed = [
  {
    A: HydrogenBottlingBatchSeed[0].id,
    B: HydrogenProductionBatchSeed[2].id,
  },
  {
    A: HydrogenBottlingBatchSeed[0].id,
    B: HydrogenProductionBatchSeed[3].id,
  },
  {
    A: HydrogenBottlingBatchSeed[0].id,
    B: HydrogenProductionBatchSeed[4].id,
  },
  {
    A: HydrogenBottlingBatchSeed[1].id,
    B: HydrogenProductionBatchSeed[6].id,
  },
  {
    A: HydrogenBottlingBatchSeed[1].id,
    B: HydrogenProductionBatchSeed[7].id,
  },
  {
    A: HydrogenBottlingBatchSeed[2].id,
    B: HydrogenProductionBatchSeed[5].id,
  },
  {
    A: HydrogenBottlingBatchSeed[2].id,
    B: HydrogenProductionBatchSeed[8].id,
  },
];

export const BatchRelationTransportationBottlingSeed = HydrogenTransportationBatchSeed.map(
  (batchTransported, index) => ({
    A: batchTransported.id,
    B: HydrogenBottlingBatchSeed[index].id,
  }),
);
