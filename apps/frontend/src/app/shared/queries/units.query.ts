/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitsService } from '../services/units/units.service';
import { QUERY_KEYS } from './shared-query-keys';

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: QUERY_KEYS.HYDROGEN_PRODUCTION_UNITS,
  queryFn: () => unitsService.getHydrogenProductionUnits(),
  staleTime: 60 * 1000,
});

export const powerProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: QUERY_KEYS.POWER_PRODUCTION_UNITS,
  queryFn: () => unitsService.getPowerProductionUnits(),
  staleTime: 60 * 1000,
});
