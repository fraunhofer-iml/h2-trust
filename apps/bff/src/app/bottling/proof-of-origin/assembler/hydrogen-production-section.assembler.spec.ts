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
import { HydrogenProductionSectionAssembler } from './hydrogen-production-section.assembler';

describe('HydrogenProductionSectionAssembler.buildHydrogenProductionSection', () => {
  let assembler: HydrogenProductionSectionAssembler;
  let processClientMock: { send: jest.Mock };

  beforeEach(() => {
    processClientMock = { send: jest.fn() };
    processClientMock.send.mockReturnValue(of({ result: 0, basisOfCalculation: '' }));
    assembler = new HydrogenProductionSectionAssembler(processClientMock as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty classifications when no process steps provided', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [];

    const actualResponse = await assembler.buildHydrogenProductionSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME);
    expect(actualResponse.batches).toEqual([]);
    expect(actualResponse.classifications).toEqual([]);
  });

  it('should return one classification (yellow)', async () => {
    const givenProcessSteps: ProcessStepEntity[] = [ProcessStepEntityHydrogenProductionMock[0]];

    const actualResponse = await assembler.buildHydrogenProductionSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME);
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

    const actualResponse = await assembler.buildHydrogenProductionSection(givenProcessSteps);

    expect(actualResponse.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME);
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
