/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ProcessStepEntity, ProcessStepEntityHydrogenProductionMock } from '@h2-trust/amqp';
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

  it('should return one classification (yellow)', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [ProcessStepEntityHydrogenProductionMock[0]];

    const actualResponse = await service.buildHydrogenStorageSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications.length).toBe(1);

    const yellow = actualResponse.classifications.find((c) => c.name === HydrogenColor.YELLOW);
    expect(yellow).toBeDefined();
    expect((yellow?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[0].batch.id]);
  });

  it('should return two classification (yellow + pink)', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [
      ProcessStepEntityHydrogenProductionMock[0],
      ProcessStepEntityHydrogenProductionMock[1],
    ];

    const actualResponse = await service.buildHydrogenStorageSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications.length).toBe(2);

    const yellow = actualResponse.classifications.find((c) => c.name === HydrogenColor.YELLOW);
    const pink = actualResponse.classifications.find((c) => c.name === HydrogenColor.PINK);

    expect(yellow).toBeDefined();
    expect(pink).toBeDefined();

    expect((yellow?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[0].batch.id]);
    expect((pink?.batches || []).map((b) => b.id)).toEqual([givenProcessSteps[1].batch.id]);
  });
});
