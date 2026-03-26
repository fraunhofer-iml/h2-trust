/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsEntity } from '@h2-trust/amqp';
import { HydrogenColor, PowerType, RfnboType } from '@h2-trust/domain';

export const QualityDetailsEntityFixture = {
  createGreen: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.GREEN,
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
      overrides.powerType ?? PowerType.RENEWABLE,
    ),
  createYellow: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.YELLOW,
      overrides.rfnboType ?? RfnboType.NON_CERTIFIABLE,
      overrides.powerType ?? PowerType.NON_RENEWABLE,
    ),
  createMix: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.MIX,
      overrides.rfnboType ?? RfnboType.NON_CERTIFIABLE,
      overrides.powerType ?? PowerType.NON_RENEWABLE,
    ),
} as const;
