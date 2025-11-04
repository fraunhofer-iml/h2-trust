/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApproval } from '@prisma/client';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { CompanySeed } from './company.seed';
import { DocumentSeed } from './document.seed';
import { PowerProductionUnitSeed } from './unit';

export const PowerAccessApprovalSeed = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-0',
    decidedAt: new Date('2025-02-01'),
    status: PowerAccessApprovalStatus.APPROVED,
    powerProducerId: CompanySeed[0].id,
    powerProductionUnitId: PowerProductionUnitSeed[0].id,
    hydrogenProducerId: CompanySeed[2].id,
    documentId: DocumentSeed[0].id,
  },
  {
    id: 'power-access-approval-1',
    decidedAt: new Date('2025-02-01'),
    status: PowerAccessApprovalStatus.APPROVED,
    powerProducerId: CompanySeed[2].id,
    powerProductionUnitId: PowerProductionUnitSeed[1].id,
    hydrogenProducerId: CompanySeed[2].id,
    documentId: DocumentSeed[0].id,
  },
  {
    id: 'power-access-approval-2',
    decidedAt: new Date('2025-08-14'),
    status: PowerAccessApprovalStatus.APPROVED,
    powerProducerId: CompanySeed[2].id,
    powerProductionUnitId: PowerProductionUnitSeed[2].id,
    hydrogenProducerId: CompanySeed[2].id,
    documentId: DocumentSeed[0].id,
  },
  {
    id: 'power-access-approval-3',
    decidedAt: new Date('2025-08-14'),
    status: PowerAccessApprovalStatus.APPROVED,
    powerProducerId: CompanySeed[1].id,
    powerProductionUnitId: PowerProductionUnitSeed[3].id,
    hydrogenProducerId: CompanySeed[2].id,
    documentId: DocumentSeed[0].id,
  },
];
