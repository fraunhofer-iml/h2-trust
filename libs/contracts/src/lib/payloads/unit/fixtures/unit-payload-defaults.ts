/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseCreateUnitPayload } from '@h2-trust/contracts/payloads';
import { AddressPayloadFixture } from '../../common/fixtures/address.fixture';

type BaseCreateUnitPayloadValues = Pick<
  BaseCreateUnitPayload,
  | 'name'
  | 'commissionedOn'
  | 'address'
  | 'ownerId'
  | 'manufacturer'
  | 'modelType'
  | 'modelNumber'
  | 'serialNumber'
  | 'certifiedBy'
  | 'operatorId'
  | 'id'
>;

export const createBaseCreateUnitPayloadValues = (
  overrides: Partial<BaseCreateUnitPayloadValues> = {},
): BaseCreateUnitPayloadValues => ({
  name: overrides.name ?? 'Unit 1',
  commissionedOn: overrides.commissionedOn ?? new Date('2026-01-01T00:00:00Z'),
  address: overrides.address ?? AddressPayloadFixture.create(),
  ownerId: overrides.ownerId ?? 'company-1',
  manufacturer: overrides.manufacturer ?? 'Unit Manufacturer',
  modelType: overrides.modelType ?? 'Model Type 1',
  modelNumber: overrides.modelNumber ?? 'Model Number 1',
  serialNumber: overrides.serialNumber ?? 'Serial Number 1',
  certifiedBy: overrides.certifiedBy ?? 'TUEV',
  operatorId: overrides.operatorId ?? 'company-2',
  id: overrides.id,
});
