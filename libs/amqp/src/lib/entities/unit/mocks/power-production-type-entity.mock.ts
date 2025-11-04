/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeSeed } from 'libs/database/src/seed';
import { PowerProductionTypeEntity } from '../power-production-type.entity';

export const PowerProductionTypeEntityMock: PowerProductionTypeEntity[] = PowerProductionTypeSeed.map(
  (seed) => new PowerProductionTypeEntity(seed.name, seed.energySource, seed.hydrogenColor),
);
