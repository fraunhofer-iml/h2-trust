/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/amqp';
import { HydrogenColor, RFNBOType } from '@h2-trust/domain';

export const HydrogenComponentEntityFixture = {
  createGreen: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      '',
      overrides.color ?? HydrogenColor.GREEN,
      overrides.amount ?? 100,
      overrides.rfnboType ?? RFNBOType.RFNBO_READY,
    ),
  createYellow: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      '',
      overrides.color ?? HydrogenColor.YELLOW,
      overrides.amount ?? 100,
      overrides.rfnboType ?? RFNBOType.NON_CERTIFIABLE,
    ),
  createMix: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      '',
      overrides.color ?? HydrogenColor.MIX,
      overrides.amount ?? 100,
      overrides.rfnboType ?? RFNBOType.NON_CERTIFIABLE,
    ),
} as const;
