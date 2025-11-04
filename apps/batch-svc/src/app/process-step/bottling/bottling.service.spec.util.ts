/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity } from '@h2-trust/amqp';

export function calculateRemainingAmount(givenBatches: BatchEntity[], amountRequiredForBottle: number) {
  return givenBatches.reduce((sum, batch) => sum + batch.amount, 0) - amountRequiredForBottle;
}
