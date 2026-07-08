/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, PowerType, RfnboType } from '@h2-trust/domain';
import {
  DocumentEntityFixture,
  HydrogenComponentEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
  RedComplianceEntityFixture,
} from '../../fixtures';
import { DigitalProductPassportEntity } from '../digital-product-passport.entity';

export const DigitalProductPassportEntityFixture = {
  create: (overrides: Partial<DigitalProductPassportEntity> = {}): DigitalProductPassportEntity => ({
    id: overrides.id ?? 'dpp-1',
    filledAt: overrides.filledAt ?? new Date('2025-04-07T16:00:00.000Z'),
    owner: overrides.owner ?? 'H2 Logistics',
    filledAmount: overrides.filledAmount ?? 10,
    producer: overrides.producer ?? 'HydroGen GmbH',
    product: overrides.product ?? BatchType.HYDROGEN,
    hydrogenComposition: overrides.hydrogenComposition ?? [HydrogenComponentEntityFixture.createRfnboReady()],
    attachedFiles: overrides.attachedFiles ?? [DocumentEntityFixture.create()],
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    proofOfSustainability: overrides.proofOfSustainability ?? ProofOfSustainabilityEntityFixture.create(),
    proofOfOrigin: overrides.proofOfOrigin ?? [ProofOfOriginSectionEntityFixture.create()],
    redCompliance: overrides.redCompliance ?? RedComplianceEntityFixture.create(),
    isEmissionReductionAbove70Percent: overrides.isEmissionReductionAbove70Percent ?? true,
    powerType: overrides.powerType ?? PowerType.RENEWABLE,
  }),
} as const;
