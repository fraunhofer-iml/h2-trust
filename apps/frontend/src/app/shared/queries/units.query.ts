/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitOverviewDto } from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { UnitsService } from '../services/units/units.service';
import {
  isHydrogenProductionUnitOverview,
  isHydrogenStorageUnitOverview,
  isPowerProductionUnitOverview,
} from '../util/unit-type-guards';
import { QueryKeyPrefix } from './shared-query-keys';

// Generic factory for unit queries with type guard narrowing
function createUnitsQueryOptions<T extends UnitOverviewDto>(
  unitsService: UnitsService,
  type: UnitType,
  typeGuard: (u: UnitOverviewDto) => u is T,
) {
  return {
    queryKey: [QueryKeyPrefix.UNITS, type],
    queryFn: () => unitsService.getUnits(type),
    select: (units: UnitOverviewDto[]) => units.filter(typeGuard) as T[],
  };
}

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) =>
  createUnitsQueryOptions(unitsService, UnitType.HYDROGEN_PRODUCTION, isHydrogenProductionUnitOverview);

export const powerProductionUnitsQueryOptions = (unitsService: UnitsService) =>
  createUnitsQueryOptions(unitsService, UnitType.POWER_PRODUCTION, isPowerProductionUnitOverview);

export const hydrogenStorageUnitsQueryOptions = (unitsService: UnitsService) =>
  createUnitsQueryOptions(unitsService, UnitType.HYDROGEN_STORAGE, isHydrogenStorageUnitOverview);

export const unitsQueryOptions = (unitsService: UnitsService, type?: UnitType) => ({
  queryKey: [QueryKeyPrefix.UNITS, type],
  queryFn: () => unitsService.getUnits(type),
});
