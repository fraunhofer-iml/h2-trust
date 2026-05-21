/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntityFixture, ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CreateHydrogenTransportationPayload } from '@h2-trust/contracts/payloads';
import { FuelType, TransportMode } from '@h2-trust/domain';

export const CreateHydrogenTransportationPayloadFixture = {
  create: (overrides: Partial<CreateHydrogenTransportationPayload> = {}): CreateHydrogenTransportationPayload =>
    new CreateHydrogenTransportationPayload(
      overrides.processStep ?? ProcessStepEntityFixture.createHydrogenTransportation(),
      overrides.predecessorBatch ??
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-4',
          processStepId: 'process-step-4',
        }),
      overrides.transportMode ?? TransportMode.TRAILER,
      overrides.distance ?? 120,
      overrides.fuelType ?? FuelType.DIESEL,
    ),
} as const;
