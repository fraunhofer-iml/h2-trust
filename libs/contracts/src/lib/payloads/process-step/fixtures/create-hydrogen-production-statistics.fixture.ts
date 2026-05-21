/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateHydrogenProductionStatisticsPayload } from '@h2-trust/contracts/payloads';

export const CreateHydrogenProductionStatisticsPayloadFixture = {
  create: (
    overrides: Partial<CreateHydrogenProductionStatisticsPayload> = {},
  ): CreateHydrogenProductionStatisticsPayload =>
    new CreateHydrogenProductionStatisticsPayload(
      overrides.ownerId ?? 'company-1',
      overrides.month ?? new Date('2026-01-01T00:00:00Z'),
      overrides.unitName ?? 'Hydrogen Production Unit 1',
    ),
} as const;
