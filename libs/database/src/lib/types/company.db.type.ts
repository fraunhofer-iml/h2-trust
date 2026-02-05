/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyDeepQueryArgs } from '../query-args';
import { companyFlatQueryArgs } from '../query-args/company/company.flat.query-args';
import { companyNestedQueryArgs } from '../query-args/company/company.nested.query-args';

export type CompanyDeepDbType = Prisma.CompanyGetPayload<typeof companyDeepQueryArgs>;

export type CompanyNestedDbType = Prisma.CompanyGetPayload<typeof companyNestedQueryArgs>;

export type CompanyFlatDbType = Prisma.CompanyGetPayload<typeof companyFlatQueryArgs>;

export type CompanyDbBaseType = {
  id: string;
  type: string;
  name: string;
  mastrNumber: string;
  addressId: string;
};
