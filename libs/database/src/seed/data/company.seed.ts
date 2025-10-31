/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company } from '@prisma/client';
import { CompanyType } from '@h2-trust/domain';
import { AddressSeed } from './address.seed';

export const CompanySeed = <Company[]>[
  {
    id: 'company-power-0',
    name: 'Power Generation AG',
    mastrNumber: 'P12345',
    type: CompanyType.POWER_PRODUCER,
    addressId: AddressSeed[0].id,
  },
  {
    id: 'company-grid-0',
    name: 'Power Grid AG',
    mastrNumber: 'PG1000',
    type: CompanyType.POWER_PRODUCER,
    addressId: AddressSeed[1].id,
  },
  {
    id: 'company-hydrogen-0',
    name: 'Hydrogen Solutions GmbH',
    mastrNumber: 'ABR900000176543',
    type: CompanyType.HYDROGEN_PRODUCER,
    addressId: AddressSeed[2].id,
  },
  {
    id: 'company-recipient-0',
    name: 'Hydrogen Logistics',
    mastrNumber: 'R112233',
    type: CompanyType.HYDROGEN_RECIPIENT,
    addressId: AddressSeed[3].id,
  },
];
