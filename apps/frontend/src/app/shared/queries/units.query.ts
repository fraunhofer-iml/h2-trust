/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitsService } from '../services/units/units.service';
import { QueryKeyPrefix } from './shared-query-keys';

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.HYDROGEN_PRODUCTION_UNITS],
  queryFn: () => unitsService.getHydrogenProductionUnits(),
});

export const powerProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.POWER_PRODUCTION_UNITS],
  queryFn: () => unitsService.getPowerProductionUnits(),
});

export const hydrogenStorageUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.HYDROGEN_STORAGE_UNITS],
  queryFn: () => unitsService.getHydrogenStorageUnits(),
});
