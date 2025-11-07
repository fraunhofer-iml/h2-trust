/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch } from '@prisma/client';
import { HydrogenBottlingBatchSeed } from './hydrogen-bottling-batch.seed';
import { HydrogenProductionBatchSeed } from './hydrogen-production-batch.seed';
import { HydrogenTransportationBatchSeed } from './hydrogen-transportation-batch.seed';
import { PowerProductionBatchSeed } from './power-production-batch.seed';
import {WaterConsumptionBatchSeed} from "./water-consumption-batch.seed";

export const BatchSeed = <Batch[]>[
  ...PowerProductionBatchSeed,
  ...WaterConsumptionBatchSeed,
  ...HydrogenProductionBatchSeed,
  ...HydrogenBottlingBatchSeed,
  ...HydrogenTransportationBatchSeed,
];
