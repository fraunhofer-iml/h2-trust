/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, CompanyType } from '@prisma/client';
import { AddressSeed } from './address.seed';

export const CompanySeed = <Company[]>[
  {
    id: 'company-power-1',
    name: 'PowerGen AG',
    mastrNumber: 'P12345',
    companyType: CompanyType.POWER_PRODUCER,
    addressId: AddressSeed[0].id,
  },
  {
    id: 'company-hydrogen-1',
    name: 'HydroGen GmbH',
    mastrNumber: 'H67890',
    companyType: CompanyType.HYDROGEN_PRODUCER,
    addressId: AddressSeed[1].id,
  },
  {
    id: 'company-recipient-1',
    name: 'H2Logistics',
    mastrNumber: 'R112233',
    companyType: CompanyType.HYDROGEN_RECIPIENT,
    addressId: AddressSeed[1].id,
  },
  {
    id: 'company-grid-1',
    name: 'Power Grid AG',
    mastrNumber: 'PG1000',
    companyType: CompanyType.POWER_PRODUCER, // maybe we need to distinguish between grid operators and power producers
    addressId: AddressSeed[3].id,
  },
];
