/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportationDetailsEntity } from '@h2-trust/amqp';
import { FuelType, TransportMode } from '@h2-trust/domain';

export const TransportationDetailsEntityFixture = {
  createPipeline: (overrides: Partial<TransportationDetailsEntity> = {}): TransportationDetailsEntity =>
    new TransportationDetailsEntity(
      overrides.id ?? 'transport-details-1',
      overrides.distance ?? 0,
      overrides.transportMode ?? TransportMode.PIPELINE,
      overrides.fuelType ?? null,
    ),
  createTrailer: (overrides: Partial<TransportationDetailsEntity> = {}): TransportationDetailsEntity =>
    new TransportationDetailsEntity(
      overrides.id ?? 'transport-details-2',
      overrides.distance ?? 100,
      overrides.transportMode ?? TransportMode.TRAILER,
      overrides.fuelType ?? FuelType.DIESEL,
    ),
} as const;
