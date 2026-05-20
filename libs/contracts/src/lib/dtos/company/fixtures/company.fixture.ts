/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDto } from '@h2-trust/contracts/dtos';
import { CompanyType } from '@h2-trust/domain';
import { AddressDtoFixture } from '../../address/fixtures';

export const CompanyDtoFixture = {
  create: (overrides: Partial<CompanyDto> = {}): CompanyDto => ({
    id: overrides.id ?? 'company-power-1',
    name: overrides.name ?? 'PowerGen AG',
    mastrNumber: overrides.mastrNumber ?? 'P12345',
    type: overrides.type ?? CompanyType.POWER_PRODUCER,
    address: overrides.address ?? AddressDtoFixture.create(),
    users: overrides.users ?? [],
  }),
  createHydrogenProducer: (overrides: Partial<CompanyDto> = {}): CompanyDto =>
    CompanyDtoFixture.create({
      ...overrides,
      id: overrides.id ?? 'company-hydrogen-1',
      name: overrides.name ?? 'HydroGen GmbH',
      mastrNumber: overrides.mastrNumber ?? 'H67890',
      type: overrides.type ?? CompanyType.HYDROGEN_PRODUCER,
      address:
        overrides.address ??
        AddressDtoFixture.create({
          street: 'Wasserstoffstrasse 1',
          postalCode: '67890',
          city: 'Wasserstadt',
          state: 'Wasserland',
          country: 'Wasserland',
        }),
    }),
  createRecipient: (overrides: Partial<CompanyDto> = {}): CompanyDto =>
    CompanyDtoFixture.create({
      ...overrides,
      id: overrides.id ?? 'company-recipient-1',
      name: overrides.name ?? 'H2Logistics',
      mastrNumber: overrides.mastrNumber ?? 'R112233',
      type: overrides.type ?? CompanyType.HYDROGEN_RECIPIENT,
      address:
        overrides.address ??
        AddressDtoFixture.create({
          street: 'Empfaengerstrasse 1',
          postalCode: '09876',
          city: 'Empfaengerstadt',
          state: 'Empfaengerland',
          country: 'Empfaengerland',
        }),
    }),
} as const;