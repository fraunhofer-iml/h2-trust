/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanySeed } from 'libs/database/src/seed';
import {
  AddressEntityGridMock,
  AddressEntityHydrogenMock,
  AddressEntityPowerMock,
  AddressEntityRecipientMock,
} from '../../address/mocks';
import { CompanyEntity } from '../company.entity';

export const CompanyEntityPowerMock: CompanyEntity = new CompanyEntity(
  CompanySeed[0].id,
  CompanySeed[0].name,
  CompanySeed[0].mastrNumber,
  CompanySeed[0].type,
  AddressEntityPowerMock,
  [],
);
export const CompanyEntityGridMock: CompanyEntity = new CompanyEntity(
  CompanySeed[1].id,
  CompanySeed[1].name,
  CompanySeed[1].mastrNumber,
  CompanySeed[1].type,
  AddressEntityGridMock,
  [],
);
export const CompanyEntityHydrogenMock: CompanyEntity = new CompanyEntity(
  CompanySeed[2].id,
  CompanySeed[2].name,
  CompanySeed[2].mastrNumber,
  CompanySeed[2].type,
  AddressEntityHydrogenMock,
  [],
);
export const CompanyEntityRecipientMock: CompanyEntity = new CompanyEntity(
  CompanySeed[3].id,
  CompanySeed[3].name,
  CompanySeed[3].mastrNumber,
  CompanySeed[3].type,
  AddressEntityRecipientMock,
  [],
);
