/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  hydrogenProductionUnitRefDeepQueryArgs,
  powerProductionUnitRefDeepQueryArgs,
} from '../unit/unit.deep.query-args';

export const stagedProductionQueryArgs = Prisma.validator<Prisma.StagedProductionDefaultArgs>()({
  include: {
    hydrogenProductionUnit: hydrogenProductionUnitRefDeepQueryArgs,
    powerProductionUnit: powerProductionUnitRefDeepQueryArgs,
  },
});
