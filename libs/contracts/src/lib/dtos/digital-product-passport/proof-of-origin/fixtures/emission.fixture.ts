/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionDto } from '@h2-trust/contracts/dtos';

export const EmissionDtoFixture = {
  create: (overrides: Partial<EmissionDto> = {}): EmissionDto => ({
    amountCO2: overrides.amountCO2 ?? 100,
    amountCO2PerKgH2: overrides.amountCO2PerKgH2 ?? 10,
    basisOfCalculation: overrides.basisOfCalculation ?? ['Fixture basis'],
  }),
} as const;