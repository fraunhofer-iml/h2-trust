/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyFlatQueryArgs } from '../company/company.flat.query-args';

export const unitNestedQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: companyFlatQueryArgs,
    operator: companyFlatQueryArgs,
    details: true,
    documents: true,
    processSteps: true,
    stagedProductions: true,
    powerPurchaseAgreements: true,
    decisions: true,
  },
});
