/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { UnitsService } from '../services/units/units.service';
import { toastQueryError } from '../util/query-error-handler';
import { QueryKeyPrefix } from './shared-query-keys';

export const hydrogenProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.HYDROGEN_PRODUCTION_UNITS],
  queryFn: () => unitsService.getHydrogenProductionUnits(),
  onError: (e: HttpErrorResponse) => toastQueryError(e),
});

export const powerProductionUnitsQueryOptions = (unitsService: UnitsService) => ({
  queryKey: [QueryKeyPrefix.POWER_PRODUCTION_UNITS],
  queryFn: () => unitsService.getPowerProductionUnits(),
  onError: (e: HttpErrorResponse) => toastQueryError(e),
});
