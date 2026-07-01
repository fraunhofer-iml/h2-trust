/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentDto } from '@h2-trust/contracts/dtos';
import { RfnboType } from '@h2-trust/domain';

export const HydrogenComponentDtoFixture = {
  create: (overrides: Partial<HydrogenComponentDto> = {}): HydrogenComponentDto => ({
    processId: overrides.processId ?? null,
    amount: overrides.amount ?? 10,
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
  }),
} as const;
