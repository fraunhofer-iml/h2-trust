/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RedComplianceEntity } from '@h2-trust/amqp';

type RedComplianceEntityOverrides = Partial<Omit<RedComplianceEntity, 'isRedCompliant'>>;

export const RedComplianceEntityFixture = {
  create: (overrides: RedComplianceEntityOverrides = {}): RedComplianceEntity =>
    new RedComplianceEntity(
      overrides.isGeoCorrelationValid ?? true,
      overrides.isTimeCorrelationValid ?? true,
      overrides.isAdditionalityFulfilled ?? true,
      overrides.financialSupportReceived ?? true,
    ),
} as const;
