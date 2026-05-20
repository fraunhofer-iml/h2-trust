/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyBaseDto } from '@h2-trust/contracts/dtos';
export const CompanyBaseDtoFixture = {
  create: (overrides: Partial<CompanyBaseDto> = {}): CompanyBaseDto => ({
    id: overrides.id ?? 'company-power-1',
    name: overrides.name ?? 'PowerGen AG',
  }),
  createHydrogenProducer: (overrides: Partial<CompanyBaseDto> = {}): CompanyBaseDto =>
    CompanyBaseDtoFixture.create({
      ...overrides,
      id: overrides.id ?? 'company-hydrogen-1',
      name: overrides.name ?? 'HydroGen GmbH',
    }),
  createRecipient: (overrides: Partial<CompanyBaseDto> = {}): CompanyBaseDto =>
    CompanyBaseDtoFixture.create({
      ...overrides,
      id: overrides.id ?? 'company-recipient-1',
      name: overrides.name ?? 'H2Logistics',
    }),
} as const;