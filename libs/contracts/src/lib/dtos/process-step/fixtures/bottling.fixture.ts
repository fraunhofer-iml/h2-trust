/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottlingDto } from '@h2-trust/contracts/dtos';
import { FuelType, RfnboType, TransportMode } from '@h2-trust/domain';

export const BottlingDtoFixture = {
  create: (overrides: Partial<BottlingDto> = {}): BottlingDto => ({
    amount: overrides.amount ?? 1,
    recipient: overrides.recipient ?? 'company-recipient-1',
    filledAt: overrides.filledAt ?? '2025-04-07T00:00:00.000Z',
    recordedBy: overrides.recordedBy ?? 'user-id-1',
    hydrogenStorageUnit: overrides.hydrogenStorageUnit ?? 'hydrogen-storage-unit-1',
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    file: overrides.file,
    transportMode: overrides.transportMode ?? TransportMode.TRAILER,
    distance: overrides.distance ?? 1000,
    fuelType: overrides.fuelType ?? FuelType.DIESEL,
  }),
} as const;