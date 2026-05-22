/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CreateManyProcessStepsPayload } from '@h2-trust/contracts/payloads';

export const CreateManyProcessStepsPayloadFixture = {
  create: (overrides: Partial<CreateManyProcessStepsPayload> = {}): CreateManyProcessStepsPayload =>
    new CreateManyProcessStepsPayload(overrides.processSteps ?? [ProcessStepEntityFixture.createHydrogenProduction()]),
} as const;
