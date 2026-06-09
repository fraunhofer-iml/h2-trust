/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyNestedQueryArgs } from '../company/company.nested.query-args';
import { powerPurchaseAgreementDecisionDeepQueryArgs } from '../decision';
import { unitNestedQueryArgs } from '../unit';
import { userDeepQueryArgs } from '../user';

export const powerPurchaseAgreementDeepQueryArgs = Prisma.validator<Prisma.PowerPurchaseAgreementDefaultArgs>()({
  include: {
    requestedCompany: companyNestedQueryArgs,
    hydrogenProducer: companyNestedQueryArgs,
    powerProductionUnit: unitNestedQueryArgs,
    requestingUser: userDeepQueryArgs,
    decision: powerPurchaseAgreementDecisionDeepQueryArgs,
  },
});
