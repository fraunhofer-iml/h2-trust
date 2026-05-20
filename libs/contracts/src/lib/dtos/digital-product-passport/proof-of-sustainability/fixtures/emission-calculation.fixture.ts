/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionCalculationDto } from '@h2-trust/contracts/dtos';
import { CalculationTopic, MeasurementUnit } from '@h2-trust/domain';

export const EmissionCalculationDtoFixture = {
  create: (overrides: Partial<EmissionCalculationDto> = {}): EmissionCalculationDto => ({
    name: overrides.name ?? 'Power supply emission',
    basisOfCalculation: overrides.basisOfCalculation ?? ['Fixture basis'],
    result: overrides.result ?? 10,
    unit: overrides.unit ?? MeasurementUnit.G_CO2_PER_MJ_H2,
    calculationTopic: overrides.calculationTopic ?? CalculationTopic.POWER_SUPPLY,
  }),
} as const;