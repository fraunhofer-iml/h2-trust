/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { powerProductionUnitDeepQueryArgs } from '../unit';
import { userDeepQueryArgs } from '../user';

export const decisionDeepQueryArgs = Prisma.validator<Prisma.DecisionDefaultArgs>()({
  include: {
    decidingUser: userDeepQueryArgs,
    grantedPowerProductionUnit: powerProductionUnitDeepQueryArgs,
  },
});
