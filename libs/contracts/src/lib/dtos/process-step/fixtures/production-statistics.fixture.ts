/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStatisticsDto, PowerStatisticsDto, ProductionStatisticsDto } from '@h2-trust/contracts/dtos';

export const ProductionStatisticsDtoFixture = {
  createHydrogen: (overrides: Partial<HydrogenStatisticsDto> = {}): HydrogenStatisticsDto => ({
    total: overrides.total ?? 100,
    nonCertifiable: overrides.nonCertifiable ?? 40,
    rfnboReady: overrides.rfnboReady ?? 60,
  }),
  createPower: (overrides: Partial<PowerStatisticsDto> = {}): PowerStatisticsDto => ({
    total: overrides.total ?? 150,
    renewable: overrides.renewable ?? 90,
    partlyRenewable: overrides.partlyRenewable ?? 30,
    nonRenewable: overrides.nonRenewable ?? 30,
  }),
  create: (overrides: Partial<ProductionStatisticsDto> = {}): ProductionStatisticsDto => ({
    hydrogen: overrides.hydrogen ?? ProductionStatisticsDtoFixture.createHydrogen(),
    power: overrides.power ?? ProductionStatisticsDtoFixture.createPower(),
  }),
} as const;