/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companySurfaceQueryArgs } from '../company/company.surface.query-args';

export const userShallowQueryArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    company: companySurfaceQueryArgs,
  },
});
