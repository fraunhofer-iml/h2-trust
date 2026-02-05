/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyFlatQueryArgs } from '../company/company.flat.query-args';

export const userNestedQueryArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    company: companyFlatQueryArgs,
  },
});
