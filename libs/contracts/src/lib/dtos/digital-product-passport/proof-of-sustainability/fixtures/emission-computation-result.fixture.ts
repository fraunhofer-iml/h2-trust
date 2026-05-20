/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionComputationResultDto } from '@h2-trust/contracts/dtos';
import { EmissionCalculationDtoFixture } from './emission-calculation.fixture';
import { EmissionForProcessStepDtoFixture } from './process-step-emission.fixture';

export const EmissionComputationResultDtoFixture = {
  create: (overrides: Partial<EmissionComputationResultDto> = {}): EmissionComputationResultDto => ({
    calculations: overrides.calculations ?? [EmissionCalculationDtoFixture.create()],
    processStepEmissions: overrides.processStepEmissions ?? [EmissionForProcessStepDtoFixture.create()],
    amountCO2PerMJH2: overrides.amountCO2PerMJH2 ?? 3,
    emissionReductionPercentage: overrides.emissionReductionPercentage ?? 75,
  }),
} as const;
