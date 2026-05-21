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

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.UNITS, UnitType.HYDROGEN_PRODUCTION],
  queryFn: () => unitsService.getUnits(UnitType.HYDROGEN_PRODUCTION),
  select: (units: UnitOverviewDto[]) => units.filter((u) => isHydrogenProductionUnitOverview(u)),
});

export const powerProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.UNITS, UnitType.POWER_PRODUCTION],
  queryFn: () => unitsService.getUnits(UnitType.POWER_PRODUCTION),
  select: (units: UnitOverviewDto[]) => units.filter((u) => isPowerProductionUnitOverview(u)),
});

export const hydrogenStorageUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.UNITS, UnitType.HYDROGEN_STORAGE],
  queryFn: () => unitsService.getUnits(UnitType.HYDROGEN_STORAGE),
  select: (units: UnitOverviewDto[]) => units.filter((u) => isHydrogenStorageUnitOverview(u)),
});

export const unitsQueryOptions = (unitsService: UnitsService, type?: UnitType) => ({
  queryKey: [QueryKeyPrefix.UNITS, type],
  queryFn: () => unitsService.getUnits(type),
});
