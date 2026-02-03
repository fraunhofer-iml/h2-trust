/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyDeepQueryArgs, companyShallowQueryArgs, companySurfaceQueryArgs } from '../query-args';

export type CompanyDeepDbType = Prisma.CompanyGetPayload<typeof companyDeepQueryArgs>;

export type CompanyDbShallowType = Prisma.CompanyGetPayload<typeof companyShallowQueryArgs>;

export type CompanyDbSurfaceType = Prisma.CompanyGetPayload<typeof companySurfaceQueryArgs>;

export type CompanyDbBaseType = {
  id: string;
  type: string;
  name: string;
  mastrNumber: string;
  addressId: string;
};
