/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionOverviewDto } from '@h2-trust/contracts/dtos';
import { HydrogenProductionTechnology } from '@h2-trust/domain';

export const HydrogenProductionOverviewDtoFixture = {
  create: (overrides: Partial<HydrogenProductionOverviewDto> = {}): HydrogenProductionOverviewDto => ({
    id: overrides.id ?? 'hydrogen-production-unit-1',
    name: overrides.name ?? 'Electrolyzer 1',
    ratedPower: overrides.ratedPower ?? 50,
    technology: overrides.technology ?? HydrogenProductionTechnology.PEM,
    producing: overrides.producing ?? true,
    powerPurchaseAgreementStatus: overrides.powerPurchaseAgreementStatus ?? true,
    powerProducerId: overrides.powerProducerId ?? 'company-power-1',
    powerProducerName: overrides.powerProducerName ?? 'PowerGen AG',
    active: overrides.active ?? true,
  }),
} as const;
