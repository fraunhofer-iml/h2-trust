/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { createBatch, createProcessStep, setupTraversalServiceTestingModule } from './traversal.test-helpers';

describe('TraversalService', () => {
  let service: TraversalService;
  let batchSvcSendMock: jest.Mock;

  beforeEach(async () => {
    ({ service, batchSvcSendMock } = await setupTraversalServiceTestingModule());
  });

  describe('fetchHydrogenProductionsFromHydrogenBottling', () => {
    it(`throws if ${ProcessType.HYDROGEN_BOTTLING} process step is null`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = null;

      const expectedError = `Process steps of type [${ProcessType.HYDROGEN_BOTTLING}] are missing.`;

      // act & assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a processStep is not ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []);

      const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${givenProcessStep.id} (${ProcessType.HYDROGEN_PRODUCTION})`;

      // act & assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a ${ProcessType.HYDROGEN_BOTTLING} process step has no predecessor batch`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

      const expectedError = `No predecessors found for process step [${givenProcessStep.id}]`;

      // act & assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a predecessor process step is not ${ProcessType.HYDROGEN_PRODUCTION}`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [
        createBatch('b1'),
      ]);

      const invalidPredecessorProcessStep: ProcessStepEntity = createProcessStep(
        'pp1',
        ProcessType.POWER_PRODUCTION,
        [],
      );
      batchSvcSendMock.mockReturnValueOnce(of(invalidPredecessorProcessStep));

      const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${invalidPredecessorProcessStep.id} (${invalidPredecessorProcessStep.type})`;

      // act & assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it('throws if a predecessor process step is null', async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [
        createBatch('b1'),
      ]);

      batchSvcSendMock.mockReturnValueOnce(of(null));

      const expectedError = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

      // act & assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`should return one ${ProcessType.HYDROGEN_PRODUCTION} process step`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, [
        createBatch('b1'),
      ]);

      const expectedResult: ProcessStepEntity[] = [createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])];

      batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

      // act
      const actualResult: ProcessStepEntity[] =
        await service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep);

      // assert
      expect(Array.isArray(actualResult)).toBe(true);
      expect(actualResult.length).toEqual(expectedResult.length);
      expect(actualResult).toEqual(expectedResult);
    });

    it(`should return multiple ${ProcessType.HYDROGEN_PRODUCTION} process steps if multiple predecessor batches exist`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [
        createBatch('b1'),
        createBatch('b2'),
      ]);

      const expectedResult: ProcessStepEntity[] = [
        createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []),
        createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, []),
      ];

      batchSvcSendMock.mockReturnValueOnce(of(expectedResult[0])).mockReturnValueOnce(of(expectedResult[1]));

      // act
      const actualResult: ProcessStepEntity[] =
        await service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep);

      // assert
      expect(Array.isArray(actualResult)).toBe(true);
      expect(actualResult.length).toEqual(expectedResult.length);
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
