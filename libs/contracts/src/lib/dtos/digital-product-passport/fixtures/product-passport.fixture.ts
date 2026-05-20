/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DigitalProductPassportDto } from '@h2-trust/contracts/dtos';
import { BatchType } from '@h2-trust/domain';
import { FileInfoDtoFixture } from '../../file/fixtures';
import { HydrogenComponentDtoFixture, RfnboComplianceDtoFixture } from '../general-information/fixtures';
import { SectionDtoFixture } from '../proof-of-origin/fixtures';
import { ProofOfSustainabilityDtoFixture } from '../proof-of-sustainability/fixtures';

export const DigitalProductPassportDtoFixture = {
  create: (overrides: Partial<DigitalProductPassportDto> = {}): DigitalProductPassportDto => ({
    id: overrides.id ?? 'dpp-1',
    filledAt: overrides.filledAt ?? new Date('2025-04-07T16:00:00.000Z'),
    owner: overrides.owner ?? 'H2Logistics',
    filledAmount: overrides.filledAmount ?? 10,
    producer: overrides.producer ?? 'HydroGen GmbH',
    product: overrides.product ?? BatchType.HYDROGEN,
    hydrogenComposition: overrides.hydrogenComposition ?? [HydrogenComponentDtoFixture.create()],
    attachedFiles: overrides.attachedFiles ?? [FileInfoDtoFixture.create()],
    rfnboCompliance: overrides.rfnboCompliance ?? RfnboComplianceDtoFixture.createRenewableEnergy(),
    proofOfSustainability: overrides.proofOfSustainability ?? ProofOfSustainabilityDtoFixture.create(),
    proofOfOrigin: overrides.proofOfOrigin ?? [SectionDtoFixture.create()],
  }),
} as const;
