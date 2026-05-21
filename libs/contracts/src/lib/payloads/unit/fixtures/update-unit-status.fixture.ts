/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UpdateUnitStatusPayload } from '@h2-trust/contracts/payloads';

export const UpdateUnitStatusPayloadFixture = {
  create: (overrides: Partial<UpdateUnitStatusPayload> = {}): UpdateUnitStatusPayload => {
    const payload = new UpdateUnitStatusPayload(overrides.id ?? 'unit-1', overrides.active ?? true);

    payload.requesterCompanyId = overrides.requesterCompanyId;

    return payload;
  },
} as const;
