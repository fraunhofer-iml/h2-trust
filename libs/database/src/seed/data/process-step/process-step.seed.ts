/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessStepHydrogenBottlingSeed } from './process-step-hydrogen-bottling.seed';
import { ProcessStepHydrogenProductionSeed } from './process-step-hydrogen-production.seed';
import { ProcessStepHydrogenTransportationSeed } from './process-step-hydrogen-transportation.seed';
import { ProcessStepPowerProductionSeed } from './process-step-power-production.seed';

export const ProcessStepSeed = <ProcessStep[]>[
  ...ProcessStepPowerProductionSeed,
  ...ProcessStepHydrogenProductionSeed,
  ...ProcessStepHydrogenBottlingSeed,
  ...ProcessStepHydrogenTransportationSeed,
];
