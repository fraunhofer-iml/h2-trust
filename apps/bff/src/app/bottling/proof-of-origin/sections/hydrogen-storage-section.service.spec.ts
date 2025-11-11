/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ProcessStepEntity, ProcessStepEntityHydrogenProductionMock, QualityDetailsEntityMock } from '@h2-trust/amqp';
import { HydrogenColor, ProofOfOrigin } from '@h2-trust/domain';
import { HydrogenStorageSectionService } from './hydrogen-storage-section.service';

describe('HydrogenStorageSectionService.buildHydrogenStorageSection', () => {
  let service: HydrogenStorageSectionService;
  let processSvcMock: { send: jest.Mock };

  beforeEach(() => {
    processSvcMock = { send: jest.fn() };
    processSvcMock.send.mockReturnValue(of({ result: 0, basisOfCalculation: '' }));
    service = new HydrogenStorageSectionService(processSvcMock as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty classifications when no process steps provided', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [];

    const actualResponse = await service.buildHydrogenStorageSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications).toEqual([]);
  });

  it('should return one classification (green)', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [ProcessStepEntityHydrogenProductionMock[0]];
    givenProcessSteps[0].batch.qualityDetails = structuredClone(QualityDetailsEntityMock[0]); // GREEN

    const actualResponse = await service.buildHydrogenStorageSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications.length).toBe(1);

    const green = actualResponse.classifications.find((c) => c.name === HydrogenColor.GREEN);
    expect(green).toBeDefined();
    expect((green?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[0].batch.id]);
  });

  it('should return two classification (green + yellow)', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [
      ProcessStepEntityHydrogenProductionMock[0],
      ProcessStepEntityHydrogenProductionMock[6],
    ];
    givenProcessSteps[0].batch.qualityDetails = structuredClone(QualityDetailsEntityMock[0]); // GREEN
    givenProcessSteps[1].batch.qualityDetails = structuredClone(QualityDetailsEntityMock[1]); // YELLOW

    const actualResponse = await service.buildHydrogenStorageSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications.length).toBe(2);

    const green = actualResponse.classifications.find((c) => c.name === HydrogenColor.GREEN);
    const yellow = actualResponse.classifications.find((c) => c.name === HydrogenColor.YELLOW);

    expect(green).toBeDefined();
    expect(yellow).toBeDefined();

    expect((green?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[0].batch.id]);
    expect((yellow?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[1].batch.id]);
  });
});
