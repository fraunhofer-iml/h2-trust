/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDetailsDto } from '@h2-trust/contracts/dtos';
import { CompanyType } from '@h2-trust/domain';
import { AddressDtoFixture } from '../../address/fixtures';

export const UserDetailsDtoFixture = {
  create: (overrides: Partial<UserDetailsDto> = {}): UserDetailsDto => ({
    id: overrides.id ?? 'user-id-1',
    name: overrides.name ?? 'Max Mustermann',
    email: overrides.email ?? 'max.mustermann@example.com',
    company: overrides.company ?? {
      id: 'company-power-1',
      name: 'PowerGen AG',
      mastrNumber: 'P12345',
      type: CompanyType.POWER_PRODUCER,
      address: AddressDtoFixture.create(),
      users: [],
    },
  }),
} as const;
