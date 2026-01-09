/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';

export interface BatchSelection {
  batchesForBottle: BatchEntity[];
  processStepsToBeSplit: ProcessStepEntity[];
  consumedSplitProcessSteps: ProcessStepEntity[];
  processStepsForRemainingAmount: ProcessStepEntity[];
}
