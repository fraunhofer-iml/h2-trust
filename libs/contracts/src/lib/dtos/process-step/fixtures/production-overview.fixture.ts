/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionOverviewDto } from '@h2-trust/contracts/dtos';
import { PowerType, RfnboType } from '@h2-trust/domain';

export const ProductionOverviewDtoFixture = {
  create: (overrides: Partial<ProductionOverviewDto> = {}): ProductionOverviewDto => ({
    startedAt: overrides.startedAt ?? '2025-04-07T08:00:00.000Z',
    endedAt: overrides.endedAt ?? '2025-04-07T16:00:00.000Z',
    productionUnit: overrides.productionUnit ?? 'Hydrogen Production Unit 1',
    producedAmount: overrides.producedAmount ?? 12,
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    powerProducer: overrides.powerProducer ?? 'PowerGen AG',
    powerConsumed: overrides.powerConsumed ?? 50,
    storageUnit: overrides.storageUnit ?? 'Hydrogen Storage Unit 1',
    powerType: overrides.powerType ?? PowerType.RENEWABLE,
    powerProductionUnit: overrides.powerProductionUnit ?? 'Power Production Unit 1',
  }),
} as const;
