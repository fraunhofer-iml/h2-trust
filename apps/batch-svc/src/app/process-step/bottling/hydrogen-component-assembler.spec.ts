/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, QualityDetailsEntity, QualityDetailsEntityMock } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from './hydrogen-component-assembler';

describe('HydrogenComponentAssembler', () => {
  let bottlingProcessStep: ProcessStepEntity;

  beforeEach(() => {
    bottlingProcessStep = {
      id: 'test-process-step-id',
      startedAt: new Date('2025-01-01T00:00:00Z'),
      endedAt: new Date('2025-01-01T01:00:00Z'),
      type: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: 1,
        qualityDetails: QualityDetailsEntityMock[2], // MIX
        type: BatchType.HYDROGEN,
        predecessors: [],
      },
    };
  });

  it('should calculate hydrogen composition with one color', () => {
    bottlingProcessStep.batch.predecessors = [
      { amount: 1, qualityDetails: QualityDetailsEntityMock[0], type: BatchType.HYDROGEN },
    ];

    const expectedResponse = [{ color: HydrogenColor.GREEN, amount: 1 }];

    const actualResponse = HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should not calculate hydrogen composition without a processStep', () => {
    const expectedErrorMessage = 'The provided bottling process step is missing (undefined or null).';

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(undefined)).toThrow(expectedErrorMessage);
  });

  it('should not calculate hydrogen composition with an invalid process type', () => {
    bottlingProcessStep.type = 'INVALID_TYPE';

    const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} should be type HYDROGEN_BOTTLING or HYDROGEN_TRANSPORTATION, but is ${bottlingProcessStep.type}.`;

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
      { amount: 1, qualityDetails: QualityDetailsEntityMock[0], type: BatchType.HYDROGEN },
      { amount: 2, qualityDetails: QualityDetailsEntityMock[0], type: BatchType.POWER },
    ];

    const expectedErrorMessage = `Predecessor batch ${bottlingProcessStep.batch.predecessors[0].id} should be type ${BatchType.HYDROGEN}, but is ${BatchType.POWER}.`;

    expect(() => HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep)).toThrow(
      expectedErrorMessage,
    );
  });
});
