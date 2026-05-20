/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionForProcessStepDto } from '@h2-trust/contracts/dtos';

export const EmissionForProcessStepDtoFixture = {
  create: (overrides: Partial<EmissionForProcessStepDto> = {}): EmissionForProcessStepDto => ({
    amount: overrides.amount ?? 10,
    name: overrides.name ?? 'Hydrogen bottling',
    description: overrides.description ?? 'Fixture process step emission',
    processStepType: overrides.processStepType ?? 'APPLICATION',
  }),
} as const;
