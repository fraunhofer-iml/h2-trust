/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserEntity } from '@h2-trust/contracts/entities';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';

export const UserEntityFixture = {
  createPowerUser: (overrides: Partial<UserEntity> = {}): UserEntity =>
    new UserEntity(
      overrides.id ?? 'user-1',
      overrides.name ?? 'Power User',
      overrides.email ?? 'user@power.com',
      overrides.company ?? CompanyEntityFixture.createPowerProducer(),
    ),
  createHydrogenUser: (overrides: Partial<UserEntity> = {}): UserEntity =>
    new UserEntity(
      overrides.id ?? 'user-2',
      overrides.name ?? 'Hydrogen User',
      overrides.email ?? 'user@hydrogen.com',
      overrides.company ?? CompanyEntityFixture.createHydrogenProducer(),
    ),
} as const;
