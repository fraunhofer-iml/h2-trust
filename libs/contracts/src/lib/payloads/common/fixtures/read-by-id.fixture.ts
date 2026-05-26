/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadByIdPayload } from '@h2-trust/contracts/payloads';

export const ReadByIdPayloadFixture = {
  create: (overrides: Partial<ReadByIdPayload> = {}): ReadByIdPayload => new ReadByIdPayload(overrides.id ?? 'id-1'),
} as const;
