/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDetails } from '@prisma/client';
import { auditTimestamp } from '../audit-timestamp.constant';
import { HydrogenBottlingBatchSeed } from './hydrogen-bottling-batch.seed';
import { HydrogenProductionBatchSeed } from './hydrogen-production-batch.seed';
import { HydrogenTransportationBatchSeed } from './hydrogen-transportation-batch.seed';
import { PowerProductionBatchSeed } from './power-production-batch.seed';
import { QualityDetailsSeed } from './quality-details.seed';

export const BatchDetailsSeed: readonly BatchDetails[] = Object.freeze([
  {
    id: QualityDetailsSeed[0].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[1].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[2].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[2].id,
  },
  {
    id: QualityDetailsSeed[3].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[3].id,
  },
  {
    id: QualityDetailsSeed[4].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[4].id,
  },
  {
    id: QualityDetailsSeed[5].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[5].id,
  },
  {
    id: QualityDetailsSeed[6].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[6].id,
  },
  {
    id: QualityDetailsSeed[7].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[7].id,
  },
  {
    id: QualityDetailsSeed[8].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[8].id,
  },
  {
    id: QualityDetailsSeed[9].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenProductionBatchSeed[9].id,
  },
  {
    id: QualityDetailsSeed[10].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenBottlingBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[11].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenBottlingBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[12].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenBottlingBatchSeed[2].id,
  },
  {
    id: QualityDetailsSeed[13].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenTransportationBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[14].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenTransportationBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[15].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: HydrogenTransportationBatchSeed[2].id,
  },

  {
    id: QualityDetailsSeed[16].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[0].id,
  },
  {
    id: QualityDetailsSeed[17].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[1].id,
  },
  {
    id: QualityDetailsSeed[18].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[2].id,
  },
  {
    id: QualityDetailsSeed[19].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[3].id,
  },
  {
    id: QualityDetailsSeed[20].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[4].id,
  },
  {
    id: QualityDetailsSeed[21].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[5].id,
  },
  {
    id: QualityDetailsSeed[22].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[6].id,
  },
  {
    id: QualityDetailsSeed[23].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[7].id,
  },
  {
    id: QualityDetailsSeed[24].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[8].id,
  },
  {
    id: QualityDetailsSeed[25].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    batchId: PowerProductionBatchSeed[9].id,
  },
]);
