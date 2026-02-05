/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyDeepQueryArgs } from '../query-args';
import { companyShallowQueryArgs } from '../query-args/company/company.shallow.query-args';
import { companySurfaceQueryArgs } from '../query-args/company/company.surface.query-args';

export type CompanyDeepDbType = Prisma.CompanyGetPayload<typeof companyDeepQueryArgs>;

export type CompanyShallowDbType = Prisma.CompanyGetPayload<typeof companyShallowQueryArgs>;

export type CompanySurfaceDbType = Prisma.CompanyGetPayload<typeof companySurfaceQueryArgs>;

export type CompanyDbBaseType = {
  id: string;
  type: string;
  name: string;
  mastrNumber: string;
  addressId: string;
};
