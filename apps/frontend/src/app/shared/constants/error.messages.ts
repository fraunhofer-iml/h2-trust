/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ERROR_MESSAGES {
  createProductionFailed = 'Failed to add production data.',
  addBottleFailed = 'Failed to add Bottle',
  maxCapacityExceeded = 'Maximum storage capacity exceeded!',
  amountIsGreaterThanRemainingCapacity = 'The amount entered exceeds the available storage capacity.',
  fileNotFound = 'File not found.',
  dppNotFound = 'No digital product passport was found for batch-id ',
  unitNotFound = 'No unit found with unit-id ',
  unknownError = 'Something went wrong. Please try again. ',
}
