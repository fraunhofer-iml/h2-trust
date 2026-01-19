/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserEntity } from '@h2-trust/amqp';
import { CompanyEntityFixture } from './company.entity.fixture';

export const UserEntityFixture = {
  create: (overrides: Partial<UserEntity> = {}): UserEntity =>
    new UserEntity(
      overrides.id ?? 'user-1',
      overrides.name ?? 'Dummy User',
      overrides.email ?? 'dummy@example.com',
      overrides.company ?? CompanyEntityFixture.createHydrogenProducer(),
    ),
} as const;
