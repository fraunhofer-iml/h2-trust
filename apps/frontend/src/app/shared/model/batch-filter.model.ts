/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessType } from '@h2-trust/domain';

export interface BatchFilterModel {
  batchType: ProcessType | null;
  id: string;
}
