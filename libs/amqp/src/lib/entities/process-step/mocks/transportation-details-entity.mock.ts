/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportationDetailsSeed } from 'libs/database/src/seed';
import { TransportationDetailsEntity } from '../transportation-details.entity';

export const TransportationDetailsEntityMock: TransportationDetailsEntity[] = TransportationDetailsSeed.map((seed) =>
  TransportationDetailsEntity.fromDatabase(seed),
);
