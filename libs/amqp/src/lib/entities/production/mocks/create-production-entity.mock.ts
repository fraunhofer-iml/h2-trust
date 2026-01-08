/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CompanySeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageUnitSeed,
  PowerProductionUnitSeed,
  UserSeed,
} from 'libs/database/src/seed';
import { HydrogenColor } from '@h2-trust/domain';
import { CreateProductionEntity } from '../create-production.entity';

export const CreateProductionEntityMock: CreateProductionEntity[] = [
  new CreateProductionEntity(
    new Date('2025-01-01T10:00:00Z'),
    new Date('2025-01-01T10:10:00Z'),
    PowerProductionUnitSeed[0].id,
    10,
    HydrogenProductionUnitSeed[0].id,
    5,
    UserSeed[1].id,
    HydrogenColor.GREEN,
    HydrogenStorageUnitSeed[0].id,
    CompanySeed[0].id,
    CompanySeed[2].id,
    1,
  ),
];
