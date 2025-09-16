/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchTypeDbEnum } from '@h2-trust/database';
import { HydrogenComponentAssembler } from './hydrogen-component-assembler';

describe('HydrogenComponentAssembler', () => {
  let bottlingProcessStep: ProcessStepEntity;

  beforeEach(() => {
    bottlingProcessStep = {
      id: 'test-process-step-id',
      startedAt: new Date('2025-01-01T00:00:00Z'),
      endedAt: new Date('2025-01-01T01:00:00Z'),
      processType: 'HYDROGEN_BOTTLING',
      batch: {
        amount: 1,
        quality: '{"color": "mixed"}',
        type: 'HYDROGEN',
        predecessors: [],
      },
    };
  });

  it('should calculate hydrogen composition with one color', () => {
    bottlingProcessStep.batch.predecessors = [
      { amount: 1, quality: '{"color": "green"}', type: BatchTypeDbEnum.HYDROGEN },
    ];

    const expectedResponse = [{ color: 'green', amount: 1 }];

    const actualResponse = HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should not calculate hydrogen composition without a processStep', () => {
    const expectedErrorMessage = 'The provided bottling process step is missing (undefined or null).';

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(undefined)).toThrow(expectedErrorMessage);
  });

  it('should not calculate hydrogen composition with an invalid process type', () => {
    bottlingProcessStep.processType = 'INVALID_TYPE';

    const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} should be type HYDROGEN_BOTTLING or HYDROGEN_TRANSPORTATION, but is ${bottlingProcessStep.processType}.`;

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep)).toThrow(
      expectedErrorMessage,
    );
  });

  it('should not calculate hydrogen composition without a batch', () => {
    bottlingProcessStep.batch = undefined;

    const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} does not have a batch.`;

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep)).toThrow(
      expectedErrorMessage,
    );
  });

  it('should not calculate hydrogen composition without predecessors', () => {
    bottlingProcessStep.batch.predecessors = [];

    const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} does not have predecessors.`;

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep)).toThrow(
      expectedErrorMessage,
    );
  });

  it('should not calculate hydrogen composition with an invalid predecessor type', () => {
    bottlingProcessStep.batch.predecessors = [
      { amount: 1, quality: '{"color": "blue"}', type: BatchTypeDbEnum.HYDROGEN },
      { amount: 2, quality: '{"color": "blue"}', type: BatchTypeDbEnum.POWER },
    ];

    const expectedErrorMessage = `Predecessor batch ${bottlingProcessStep.batch.predecessors[0].id} should be type ${BatchTypeDbEnum.HYDROGEN}, but is ${BatchTypeDbEnum.POWER}.`;

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep)).toThrow(
      expectedErrorMessage,
    );
  });
});
