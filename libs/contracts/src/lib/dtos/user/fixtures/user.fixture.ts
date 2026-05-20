/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDto } from '@h2-trust/contracts/dtos';

export const UserDtoFixture = {
  create: (overrides: Partial<UserDto> = {}): UserDto => ({
    id: overrides.id ?? 'user-id-1',
    name: overrides.name ?? 'Max Mustermann',
    email: overrides.email ?? 'max.mustermann@example.com',
  }),
} as const;
