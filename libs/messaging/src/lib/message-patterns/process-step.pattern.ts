/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProcessStepMessagePatterns {
  READ_ALL_BY_PREDECESSOR_TYPES_AND_OWNER = 'process-step.read-all-by-predecessor-types-and-owner',
  READ_PRODUCTION_PAGINATION = 'process-step.read-pagination-by-predecessor-types-and-owner',
  READ_PROCESS_STEP_PAGINATION = 'process-step.read-pagination-by-filter',
  READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER = 'process-step.read-all-by-types-and-active-and-owner',
  READ_ALL_BY_UNIT = 'process-step.read-all-by-unit',
  CREATE_PROCESS_STEP = 'process-step.create-process-step',
}
