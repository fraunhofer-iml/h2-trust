/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyNestedQueryArgs } from '../company/company.nested.query-args';
import { decisionDeepQueryArgs } from '../decision';
import { powerProductionUnitNestedQueryArgs } from '../unit/unit.nested.query-args';
import { userDeepQueryArgs } from '../user';

export const powerPurchaseAgreementDeepQueryArgs = Prisma.validator<Prisma.PowerPurchaseAgreementDefaultArgs>()({
  include: {
    document: true,
    powerProducer: companyNestedQueryArgs,
    hydrogenProducer: companyNestedQueryArgs,
    powerProductionUnit: powerProductionUnitNestedQueryArgs,
    creatingUser: userDeepQueryArgs,
    decision: decisionDeepQueryArgs,
  },
});
