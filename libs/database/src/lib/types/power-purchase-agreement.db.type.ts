/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  powerPurchaseAgreementDeepQueryArgs,
  powerPurchaseAgreementFlatQueryArgs,
  powerPurchaseAgreementNestedQueryArgs,
} from '../query-args';

export type PowerPurchaseAgreementDeepDbType = Prisma.PowerPurchaseAgreementGetPayload<
  typeof powerPurchaseAgreementDeepQueryArgs
>;

export type PowerPurchaseAgreementNestedDbType = Prisma.PowerPurchaseAgreementGetPayload<
  typeof powerPurchaseAgreementNestedQueryArgs
>;

export type PowerPurchaseAgreementFlatDbType = Prisma.PowerPurchaseAgreementGetPayload<
  typeof powerPurchaseAgreementFlatQueryArgs
>;
