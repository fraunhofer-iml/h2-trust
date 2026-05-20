/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressDto } from '@h2-trust/contracts/dtos';

export const AddressDtoFixture = {
  create: (overrides: Partial<AddressDto> = {}): AddressDto => ({
    street: overrides.street ?? 'Musterstrasse 1',
    postalCode: overrides.postalCode ?? '12345',
    city: overrides.city ?? 'Musterstadt',
    state: overrides.state ?? 'NRW',
    country: overrides.country ?? 'Germany',
  }),
} as const;