/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessType } from './process-type.enum';
import { UnitType } from './unit-type.enum';

export const ProcessTypeToUnitType: Record<ProcessType, UnitType> = {
  [ProcessType.POWER_PRODUCTION]: UnitType.POWER_PRODUCTION,
  [ProcessType.WATER_CONSUMPTION]: UnitType.HYDROGEN_PRODUCTION,
  [ProcessType.HYDROGEN_PRODUCTION]: UnitType.HYDROGEN_PRODUCTION,
  [ProcessType.HYDROGEN_STORAGE]: UnitType.HYDROGEN_STORAGE,
  [ProcessType.HYDROGEN_BOTTLING]: UnitType.BOTTLING,
  [ProcessType.HYDROGEN_TRANSPORTATION]: UnitType.TRANSPORTATION,
  [ProcessType.HYDROGEN_COMPRESSION]: UnitType.COMPRESSION,
  [ProcessType.HYDROGEN_END_USE]: UnitType.END_USE,
};
