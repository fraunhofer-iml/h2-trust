/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProcessStepMessagePatterns {
  READ_ALL_BY_PREDECESSOR_TYPES_AND_COMPANY = 'process-step.read-all-by-predecessor-types-and-company',
  READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY = 'process-step.read-all-by-types-and-active-and-company',
  CREATE_HYDROGEN_BOTTLING = 'process-step.create-hydrogen-bottling',
  CREATE_HYDROGEN_TRANSPORTATION = 'process-step.create-hydrogen-transportation',
}
