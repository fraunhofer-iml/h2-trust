/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDto } from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { AddressDtoFixture } from '../../address/fixtures';
import { CompanyBaseDtoFixture } from '../../company/fixtures';
import { UnitOwnerDtoFixture } from './unit-owner.fixture';

export const BaseUnitDtoFixture = {
  create: (overrides: Partial<BaseUnitDto> = {}): BaseUnitDto => ({
    id: overrides.id ?? 'unit-1',
    name: overrides.name ?? 'Fixture Unit',
    mastrNumber: overrides.mastrNumber ?? 'MASTR-001',
    manufacturer: overrides.manufacturer ?? 'Fixture Manufacturer',
    modelType: overrides.modelType ?? 'Fixture Model Type',
    modelNumber: overrides.modelNumber ?? 'Fixture Model Number',
    serialNumber: overrides.serialNumber ?? 'SN-001',
    certifiedBy: overrides.certifiedBy ?? 'Fixture Certification Body',
    commissionedOn: overrides.commissionedOn ?? new Date('2024-01-01T00:00:00.000Z'),
    address: overrides.address ?? AddressDtoFixture.create(),
    owner: overrides.owner ?? UnitOwnerDtoFixture.create(),
    operator: overrides.operator ?? CompanyBaseDtoFixture.create(),
    unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
    active: overrides.active ?? true,
  }),
} as const;