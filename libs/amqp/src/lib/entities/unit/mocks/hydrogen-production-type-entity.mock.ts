/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionTypeSeed } from 'libs/database/src/seed';
import { HydrogenProductionTypeEntity } from '../hydrogen-production-type.entity';

export const HydrogenProductionTypeEntityMock: HydrogenProductionTypeEntity[] = HydrogenProductionTypeSeed.map(
  (seed) => new HydrogenProductionTypeEntity(seed.id, seed.method, seed.technology),
);
