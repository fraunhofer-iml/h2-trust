/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  PowerProductionOverviewDto,
  PowerProductionUnitDto,
  UnitDto,
  UnitOverviewDto,
} from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';

export function isHydrogenProductionUnitOverview(unit: UnitOverviewDto): unit is HydrogenProductionOverviewDto {
  return unit.unitType === UnitType.HYDROGEN_PRODUCTION;
}

export function isHydrogenStorageUnitOverview(unit: UnitOverviewDto): unit is HydrogenStorageOverviewDto {
  return unit.unitType === UnitType.HYDROGEN_STORAGE;
}

export function isPowerProductionUnitOverview(unit: UnitOverviewDto): unit is PowerProductionOverviewDto {
  return unit.unitType === UnitType.POWER_PRODUCTION;
}

export function isHydrogenProductionUnitDetails(unit: UnitDto): unit is HydrogenProductionUnitDto {
  return unit.unitType === UnitType.HYDROGEN_PRODUCTION;
}
export function isHydrogenStorageUnitDetails(unit: UnitDto): unit is HydrogenStorageUnitDto {
  return unit.unitType === UnitType.HYDROGEN_STORAGE;
}

export function isPowerProductionUnitDetails(unit: UnitDto): unit is PowerProductionUnitDto {
  return unit.unitType === UnitType.POWER_PRODUCTION;
}
