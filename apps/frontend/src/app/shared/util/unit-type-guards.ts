/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
  UnitOverviewDto,
} from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';

export function isHydrogenProductionUnit(unit: UnitOverviewDto): unit is HydrogenProductionOverviewDto {
  return unit.unitType === UnitType.HYDROGEN_PRODUCTION;
}

export function isHydrogenStorageUnit(unit: UnitOverviewDto): unit is HydrogenStorageOverviewDto {
  return unit.unitType === UnitType.HYDROGEN_STORAGE;
}

export function isPowerProductionUnit(unit: UnitOverviewDto): unit is PowerProductionOverviewDto {
  return unit.unitType === UnitType.POWER_PRODUCTION;
}
