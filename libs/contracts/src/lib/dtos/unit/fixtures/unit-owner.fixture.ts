/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitOwnerDto } from '@h2-trust/contracts/dtos';
import { PowerPurchaseAgreementConnectionDtoFixture } from './power-purchase-agreement-connection.fixture';

export const UnitOwnerDtoFixture = {
  create: (overrides: Partial<UnitOwnerDto> = {}): UnitOwnerDto => ({
    id: overrides.id ?? 'company-owner-1',
    name: overrides.name ?? 'Hydrogen Owner GmbH',
    hydrogenAgreements: overrides.hydrogenAgreements ?? [PowerPurchaseAgreementConnectionDtoFixture.create()],
  }),
} as const;
