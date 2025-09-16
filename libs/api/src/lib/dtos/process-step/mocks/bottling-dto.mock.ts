/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelType, TransportMode } from '../../../enums';
import { BottlingDto } from '../bottling.dto';

export const BottlingDtoMock = <BottlingDto[]>[
  <BottlingDto>{
    amount: 1,
    color: 'GREEN',
    recipient: 'company-recipient-1',
    filledAt: '2025-04-07T00:00:00.000Z',
    recordedBy: 'user-id-1',
    hydrogenStorageUnit: 'hydrogen-storage-unit-1',
    fileDescription: 'Certificate for green hydrogen production',
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
  },
];
