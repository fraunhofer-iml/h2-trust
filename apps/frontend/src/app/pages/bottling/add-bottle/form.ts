/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormControl } from '@angular/forms';
import { HydrogenStorageOverviewDto, UserDto } from '@h2-trust/api';
import { FuelType, TransportMode } from '@h2-trust/domain';

export type BottlingForm = {
  date: FormControl<Date | undefined | null>;
  time: FormControl<Date | undefined | null>;
  amount: FormControl<number | undefined | null>;
  recipient: FormControl<UserDto | undefined | null>;
  storageUnit: FormControl<HydrogenStorageOverviewDto | undefined | null>;
  type: FormControl<'NON_CERTIFIABLE' | 'RFNBO_READY' | undefined | null>;
  transportMode: FormControl<TransportMode | null>;
  fuelType: FormControl<FuelType | null>;
  distance: FormControl<number | null>;
};
