/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSeed } from 'libs/database/src/seed';
import { UserEntity } from '../user.entity';

export const UserEntityPowerMock: UserEntity = new UserEntity(UserSeed[0].id, UserSeed[0].name, UserSeed[0].email);

export const UserEntityHydrogenMock: UserEntity = new UserEntity(UserSeed[1].id, UserSeed[1].name, UserSeed[1].email);
