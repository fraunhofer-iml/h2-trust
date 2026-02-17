/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document } from '@prisma/client';
import { HydrogenProductionProcessStepSeed } from './process-step';
import { UnitSeed } from './unit';

export const DocumentSeed: readonly Document[] = Object.freeze([
  {
    id: 'document-hydrogen-production-0',
    fileName: 'hydrogen-dummy.pdf',
    unitId: UnitSeed[0].id,
    processStepId: HydrogenProductionProcessStepSeed[0].id,
  },
]);
