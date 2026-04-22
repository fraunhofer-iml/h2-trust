/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma, TransportationDetails } from '@prisma/client';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';

export const TransportationDetailsSeed: readonly TransportationDetails[] = Object.freeze([
  {
    id: 'transportation-details-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    transportMode: TransportMode.PIPELINE,
    fuelType: null,
    distance: new Prisma.Decimal(0),
  },
  {
    id: 'transportation-details-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
    distance: new Prisma.Decimal(100),
  },
  {
    id: 'transportation-details-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
    distance: new Prisma.Decimal(100),
  },
]);
