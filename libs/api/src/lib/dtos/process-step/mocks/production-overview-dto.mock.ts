/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor } from '@h2-trust/domain';
import { ProductionOverviewDto } from '../production-overview.dto';

export const ProductionOverviewDtoMock = <ProductionOverviewDto[]>[
  <ProductionOverviewDto>{
    startedAt: new Date('2025-01-19').toISOString(),
    endedAt: new Date('2025-01-20').toISOString(),
    productionUnit: 'Hydrogen Generator 3000',
    producedAmount: 15,
    color: HydrogenColor.GREEN,
    powerProducer: 'PowerGen AG',
    powerConsumed: 20,
  },
  <ProductionOverviewDto>{
    startedAt: new Date('2025-01-18').toISOString(),
    endedAt: new Date('2025-01-19').toISOString(),
    productionUnit: 'Hydrogen Generator 3000',
    producedAmount: 44,
    color: HydrogenColor.GREEN,
    powerProducer: 'PowerGen AG',
    powerConsumed: 32,
  },
];
