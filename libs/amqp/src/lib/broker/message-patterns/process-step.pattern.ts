/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProcessStepMessagePatterns {
  READ_ALL = 'process-step.read-all',
  READ_UNIQUE = 'process-step.read-unique',
  CREATE = 'process-step.create',
  HYDROGEN_BOTTLING = 'process-step.hydrogen-bottling',
  HYDROGEN_TRANSPORTATION = 'process-step.hydrogen-transportation',
  CALCULATE_HYDROGEN_COMPOSITION = 'process-step.calculate_hydrogen_composition',
}
