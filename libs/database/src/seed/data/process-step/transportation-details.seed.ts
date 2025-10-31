/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma, TransportationDetails } from '@prisma/client';
import { FuelType, TransportMode } from '@h2-trust/domain';

export const TransportationDetailsSeed = <TransportationDetails[]>[
  {
    id: 'transportation-details-0',
    transportMode: TransportMode.PIPELINE,
    fuelType: undefined,
    distance: new Prisma.Decimal(0),
  },
  {
    id: 'transportation-details-1',
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
    distance: new Prisma.Decimal(100),
  },
  {
    id: 'transportation-details-2',
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
    distance: new Prisma.Decimal(100),
  },
];
