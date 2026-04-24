/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementSeed } from '../../../seed';
import { PowerPurchaseAgreementDeepDbType } from '../power-purchase-agreement.db.type';
import { CompanyDbTypeMock } from './company-db-type.mock';
import { DocumentDbTypeMock } from './document-db-type.mock';
import { PowerProductionUnitDeepDbTypeMock } from './power-production-unit-db-type.mock';
import { UserDeepDbTypeMock } from './user-db-type.mock';

export const PowerPurchaseAgreementDbTypeMock = <PowerPurchaseAgreementDeepDbType[]>[
  {
    ...PowerPurchaseAgreementSeed[0],
    creatingUser: UserDeepDbTypeMock[0],
    powerProducer: CompanyDbTypeMock[0],
    hydrogenProducer: CompanyDbTypeMock[1],
    document: DocumentDbTypeMock[0],
    powerProductionUnit: PowerProductionUnitDeepDbTypeMock[0],
    decision: null,
  },
];
