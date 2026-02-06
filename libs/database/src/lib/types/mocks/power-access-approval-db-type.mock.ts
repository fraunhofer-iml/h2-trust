/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalSeed, PowerProductionTypeSeed } from '../../../seed';
import { PowerAccessApprovalDeepDbType } from '../power-access-approval.db.type';
import { CompanyDbTypeMock } from './company-db-type.mock';
import { DocumentDbTypeMock } from './document-db-type.mock';
import { PowerProductionUnitDbTypeMock } from './power-production-unit-db-type.mock';

export const PowerAccessApprovalDbTypeMock = <PowerAccessApprovalDeepDbType[]>[
  {
    ...PowerAccessApprovalSeed[0],
    powerProducer: CompanyDbTypeMock[0],
    hydrogenProducer: CompanyDbTypeMock[1],
    document: DocumentDbTypeMock[0],
    powerProductionUnit: {
      generalInfo: { ...PowerProductionUnitDbTypeMock[0] },
      type: PowerProductionTypeSeed[0],
      ...PowerProductionUnitDbTypeMock[0].powerProductionUnit,
    },
  },
];
