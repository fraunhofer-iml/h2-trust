/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenBottlingUnitDto,
  HydrogenCompressorUnitDto,
  HydrogenEndUseUnitDto,
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  HydrogenTransportUnitDto,
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

export function isHydrogenTransportUnitDetails(unit: UnitDto): unit is HydrogenTransportUnitDto {
  return unit.unitType === UnitType.TRANSPORTATION;
}

export function isHydrogenBottlingUnitDetails(unit: UnitDto): unit is HydrogenBottlingUnitDto {
  return unit.unitType === UnitType.BOTTLING;
}

export function isHydrogenCompressorUnitDetails(unit: UnitDto): unit is HydrogenCompressorUnitDto {
  return unit.unitType === UnitType.COMPRESSION;
}

export function isHydrogenEndUseUnitDetails(unit: UnitDto): unit is HydrogenEndUseUnitDto {
  return unit.unitType === UnitType.END_USE;
}
