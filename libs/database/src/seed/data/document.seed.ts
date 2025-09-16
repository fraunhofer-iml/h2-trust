/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document } from '@prisma/client';
import { ProcessStepHydrogenProductionSeed } from './process-step';
import { UnitSeed } from './unit';

export const DocumentSeed = <Document[]>[
  {
    id: 'document-hydrogen-production-1',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    unitId: UnitSeed[0].id,
    processStepId: ProcessStepHydrogenProductionSeed[0].id,
  },
];
