/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepDetails } from '@prisma/client';
import { HydrogenTransportationProcessStepSeed } from './hydrogen-transportation-process-step.seed';
import { TransportationDetailsSeed } from './transportation-details.seed';

export const ProcessStepDetailsSeed = <ProcessStepDetails[]>[
  {
    id: TransportationDetailsSeed[0].id,
    processStepId: HydrogenTransportationProcessStepSeed[0].id,
  },
  {
    id: TransportationDetailsSeed[1].id,
    processStepId: HydrogenTransportationProcessStepSeed[1].id,
  },
  {
    id: TransportationDetailsSeed[2].id,
    processStepId: HydrogenTransportationProcessStepSeed[2].id,
  },
];
