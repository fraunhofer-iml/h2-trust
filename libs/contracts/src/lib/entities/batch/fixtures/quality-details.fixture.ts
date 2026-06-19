/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsEntity } from '@h2-trust/contracts/entities';
import { PowerType, RfnboType } from '@h2-trust/domain';

export const QualityDetailsEntityFixture = {
  create: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
      overrides.productionPowerType ?? PowerType.RENEWABLE,
    ),
} as const;
