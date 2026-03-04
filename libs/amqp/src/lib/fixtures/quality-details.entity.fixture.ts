/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsEntity } from '@h2-trust/amqp';
import { HydrogenColor, RfnboType } from '@h2-trust/domain';

export const QualityDetailsEntityFixture = {
  createGreen: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.GREEN,
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
    ),
  createYellow: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.YELLOW,
      overrides.rfnboType ?? RfnboType.NON_CERTIFIABLE,
    ),
  createMix: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.MIX,
      overrides.rfnboType ?? RfnboType.NON_CERTIFIABLE,
    ),
} as const;
