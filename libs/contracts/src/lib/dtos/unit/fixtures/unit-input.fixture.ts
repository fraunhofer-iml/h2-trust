/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitInputDto } from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { AddressDtoFixture } from '../../address/fixtures';

export const UnitInputDtoFixture = {
  create: (overrides: Partial<UnitInputDto> = {}): UnitInputDto => ({
    unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
    name: overrides.name ?? 'Fixture Unit',
    owner: overrides.owner ?? 'company-owner-1',
    operator: overrides.operator ?? 'company-operator-1',
    manufacturer: overrides.manufacturer ?? 'Fixture Manufacturer',
    modelType: overrides.modelType ?? 'Fixture Model Type',
    modelNumber: overrides.modelNumber ?? 'Fixture Model Number',
    serialNumber: overrides.serialNumber ?? 'SN-001',
    certifiedBy: overrides.certifiedBy ?? 'Fixture Certification Body',
    commissionedOn: overrides.commissionedOn ?? new Date('2024-01-01T00:00:00.000Z'),
    address: overrides.address ?? AddressDtoFixture.create(),
  }),
} as const;
