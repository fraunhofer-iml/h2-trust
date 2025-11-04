/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { HydrogenBottlingProcessStepSeed } from './hydrogen-bottling-process-step.seed';
import { HydrogenProductionProcessStepSeed } from './hydrogen-production-process-step.seed';
import { HydrogenTransportationProcessStepSeed } from './hydrogen-transportation-process-step.seed';
import { PowerProductionProcessStepSeed } from './power-production-process-step.seed';

export const ProcessStepSeed = <ProcessStep[]>[
  ...PowerProductionProcessStepSeed,
  ...HydrogenProductionProcessStepSeed,
  ...HydrogenBottlingProcessStepSeed,
  ...HydrogenTransportationProcessStepSeed,
];
