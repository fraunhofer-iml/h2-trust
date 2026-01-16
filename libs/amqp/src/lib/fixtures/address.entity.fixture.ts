/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressEntity } from '@h2-trust/amqp';

export const AddressEntityFixture = {
  create: (overrides: Partial<AddressEntity> = {}): AddressEntity =>
    new AddressEntity(
      overrides.street ?? 'Musterstraße 1',
      overrides.postalCode ?? '12345',
      overrides.city ?? 'Musterstadt',
      overrides.state ?? 'NRW',
      overrides.country ?? 'Germany',
    ),
} as const;
