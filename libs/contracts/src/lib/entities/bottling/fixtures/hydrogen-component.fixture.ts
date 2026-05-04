/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/contracts/entities';
import { RfnboType } from '@h2-trust/domain';

export const HydrogenComponentEntityFixture = {
  createRfnboReady: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity('', overrides.amount ?? 100, overrides.rfnboType ?? RfnboType.RFNBO_READY),
  createNonCertifiable: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity('', overrides.amount ?? 100, overrides.rfnboType ?? RfnboType.NON_CERTIFIABLE),
} as const;
