/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormControl } from '@angular/forms';
import { ComponentsOverviewDto, UserDto } from '@h2-trust/contracts/dtos';
import { ProcessType } from '@h2-trust/domain';

export type BottlingForm = {
  date: FormControl<Date | undefined | null>;
  time: FormControl<Date | undefined | null>;
  amount: FormControl<number | undefined | null>;
  recipient: FormControl<UserDto | undefined | null>;
  predecessorUnit: FormControl<ComponentsOverviewDto | undefined | null>;
  executingUnit: FormControl<string | undefined | null>;
  type: FormControl<'NON_CERTIFIABLE' | 'RFNBO_READY' | undefined | null>;
  distance: FormControl<number | null>;
  renewable_power: FormControl<number | null>;
  grid_power: FormControl<number | null>;
  compressed_air: FormControl<number | null>;
  nitrogen: FormControl<number | null>;
  processType: FormControl<ProcessType | null>;
};
