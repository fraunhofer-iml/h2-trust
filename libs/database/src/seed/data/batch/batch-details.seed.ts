/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDetails } from '@prisma/client';
import { QualityDetailsSeed } from './quality-details.seed';
import { HydrogenProductionBatchSeed } from './hydrogen-production-batch.seed';
import { HydrogenTransportationBatchSeed } from './hydrogen-transportation-batch.seed';
import { HydrogenBottlingBatchSeed } from './hydrogen-bottling-batch.seed';

export const BatchDetailsSeed = <BatchDetails[]>[
  {
    id: QualityDetailsSeed[0].id,
    batchId: HydrogenProductionBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[1].id,
    batchId: HydrogenProductionBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[2].id,
    batchId: HydrogenProductionBatchSeed[2].id,
  },
  {
    id: QualityDetailsSeed[3].id,
    batchId: HydrogenProductionBatchSeed[3].id,
  },
  {
    id: QualityDetailsSeed[4].id,
    batchId: HydrogenProductionBatchSeed[4].id,
  },
  {
    id: QualityDetailsSeed[5].id,
    batchId: HydrogenProductionBatchSeed[5].id,
  },
  {
    id: QualityDetailsSeed[6].id,
    batchId: HydrogenProductionBatchSeed[6].id,
  },
  {
    id: QualityDetailsSeed[7].id,
    batchId: HydrogenProductionBatchSeed[7].id,
  },
  {
    id: QualityDetailsSeed[8].id,
    batchId: HydrogenProductionBatchSeed[8].id,
  },
  {
    id: QualityDetailsSeed[9].id,
    batchId: HydrogenProductionBatchSeed[9].id,
  },
  {
    id: QualityDetailsSeed[10].id,
    batchId: HydrogenBottlingBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[11].id,
    batchId: HydrogenBottlingBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[12].id,
    batchId: HydrogenBottlingBatchSeed[2].id,
  },
  {
    id: QualityDetailsSeed[13].id,
    batchId: HydrogenTransportationBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[14].id,
    batchId: HydrogenTransportationBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[15].id,
    batchId: HydrogenTransportationBatchSeed[2].id,
  },
];
