/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepDetails } from '@prisma/client';
import { ProcessStepHydrogenTransportationSeed } from './process-step-hydrogen-transportation.seed';
import { TransportationDetailsSeed } from './transportation-details.seed';

export const ProcessStepDetailsSeed = <ProcessStepDetails[]>[
  {
    id: TransportationDetailsSeed[0].id,
    processStepId: ProcessStepHydrogenTransportationSeed[0].id,
  },
  {
    id: TransportationDetailsSeed[1].id,
    processStepId: ProcessStepHydrogenTransportationSeed[1].id,
  },
];
