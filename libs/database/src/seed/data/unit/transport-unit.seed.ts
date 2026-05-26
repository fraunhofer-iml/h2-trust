/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitSpecifications } from '@prisma/client';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';
import { UnitSeed } from './unit.seed';

export const TransportUnitSeed: readonly Partial<UnitSpecifications>[] = Object.freeze([
  {
    id: UnitSeed[6].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
  },
]);
