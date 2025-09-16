/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock, CompanyEntityPowerMock } from '../../company/mocks';
import { UserDetailsEntity } from '../user-details.entity';

export const UserDetailsEntityPowerMock: UserDetailsEntity = new UserDetailsEntity(
  UserSeed[0].id,
  UserSeed[0].name,
  UserSeed[0].email,
  CompanyEntityPowerMock,
);

export const UserDetailsEntityHydrogenMock: UserDetailsEntity = new UserDetailsEntity(
  UserSeed[1].id,
  UserSeed[1].name,
  UserSeed[1].email,
  CompanyEntityHydrogenMock,
);
