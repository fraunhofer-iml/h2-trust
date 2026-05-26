/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadByIdsPayload } from '@h2-trust/contracts/payloads';

export const ReadByIdsPayloadFixture = {
  create: (overrides: Partial<ReadByIdsPayload> = {}): ReadByIdsPayload =>
    new ReadByIdsPayload(overrides.ids ?? ['id-1', 'id-2']),
} as const;
