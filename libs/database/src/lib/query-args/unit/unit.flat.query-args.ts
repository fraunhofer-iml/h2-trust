/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';

export const unitFlatQueryArgs = Prisma.validator<Prisma.UnitDefaultArgs>()({
  include: {
    address: true,
    owner: true,
    operator: true,
    specification: true,
    documents: true,
    processSteps: true,
    stagedProductions: true,
    powerPurchaseAgreements: true,
    decisions: true,
  },
});
