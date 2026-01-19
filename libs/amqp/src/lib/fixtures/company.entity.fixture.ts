/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyEntity } from '@h2-trust/amqp';
import { CompanyType } from '@h2-trust/domain';
import { AddressEntityFixture } from './address.entity.fixture';

export const CompanyEntityFixture = {
  createPowerProducer: (overrides: Partial<CompanyEntity> = {}): CompanyEntity =>
    new CompanyEntity(
      overrides.id ?? 'company-1',
      overrides.name ?? 'Power Company',
      overrides.mastrNumber ?? 'MASTR-001',
      overrides.type ?? CompanyType.POWER_PRODUCER,
      overrides.address ?? AddressEntityFixture.create(),
      overrides.users ?? [],
    ),
  createHydrogenProducer: (overrides: Partial<CompanyEntity> = {}): CompanyEntity =>
    new CompanyEntity(
      overrides.id ?? 'company-2',
      overrides.name ?? 'Hydrogen Company',
      overrides.mastrNumber ?? 'MASTR-002',
      overrides.type ?? CompanyType.HYDROGEN_PRODUCER,
      overrides.address ?? AddressEntityFixture.create(),
      overrides.users ?? [],
    ),
} as const;
