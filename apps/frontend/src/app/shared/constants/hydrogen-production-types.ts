/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ElectrolysisType, HydrogenProductionType } from '@h2-trust/api';

export const H2_PRODUCTION_TYPES: Map<HydrogenProductionType, typeof ElectrolysisType> = new Map([
  [HydrogenProductionType.ELECTROLYSIS, ElectrolysisType],
]);
