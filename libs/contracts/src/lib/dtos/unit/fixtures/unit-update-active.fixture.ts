/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitUpdateActiveDto } from '@h2-trust/contracts/dtos';

export const UnitUpdateActiveDtoFixture = {
  create: (overrides: Partial<UnitUpdateActiveDto> = {}): UnitUpdateActiveDto => ({
    active: overrides.active ?? true,
  }),
} as const;
