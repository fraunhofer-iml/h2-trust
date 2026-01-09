/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { createBatch, createProcessStep, setupTraversalServiceTestingModule } from './traversal.test-helpers';

describe('TraversalService', () => {
  let service: TraversalService;
  let processStepServiceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    ({ service, processStepServiceMock } = await setupTraversalServiceTestingModule());
  });

  describe('fetchHydrogenBottlingFromHydrogenTransportation', () => {
    it(`throws if ${ProcessType.HYDROGEN_TRANSPORTATION} process step is null`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = null;

      const expectedError = `Process steps of type [${ProcessType.HYDROGEN_TRANSPORTATION}] are missing.`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a processStep is not ${ProcessType.HYDROGEN_TRANSPORTATION}`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

      const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_TRANSPORTATION}], but found invalid types: ${givenProcessStep.id} (${ProcessType.HYDROGEN_BOTTLING})`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a ${ProcessType.HYDROGEN_TRANSPORTATION} process step has no predecessor batch`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_TRANSPORTATION, []);

      const expectedError = `No predecessors found for process step [${givenProcessStep.id}]`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if a predecessor process step is not ${ProcessType.HYDROGEN_TRANSPORTATION}`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_TRANSPORTATION, [
        createBatch('b1'),
      ]);

      const invalidPredecessorProcessStep = createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []);
      processStepServiceMock['readProcessStep'].mockResolvedValueOnce(invalidPredecessorProcessStep);

      const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${invalidPredecessorProcessStep.id} (${invalidPredecessorProcessStep.type})`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it('throws if a predecessor process step is null', async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_TRANSPORTATION, [
        createBatch('b1'),
      ]);

      processStepServiceMock['readProcessStep'].mockResolvedValueOnce(null);

      const expectedError = `Process steps of type [${ProcessType.HYDROGEN_BOTTLING}] are missing.`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`throws if more than one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step is found`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('ht1', ProcessType.HYDROGEN_TRANSPORTATION, [
        createBatch('b1'),
        createBatch('b2'),
      ]);

      const hb1: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, []);
      const hb2: ProcessStepEntity = createProcessStep('hb2', ProcessType.HYDROGEN_BOTTLING, []);

      processStepServiceMock['readProcessStep'].mockResolvedValueOnce(hb1).mockResolvedValueOnce(hb2);

      const expectedError = `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [2].`;

      // act & assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep)).rejects.toThrow(
        expectedError,
      );
    });

    it(`should return one ${ProcessType.HYDROGEN_BOTTLING} process step`, async () => {
      // arrange
      const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_TRANSPORTATION, [
        createBatch('b1'),
      ]);

      const expectedResult: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

      processStepServiceMock['readProcessStep'].mockResolvedValue(expectedResult);

      // act
      const actualResult: ProcessStepEntity =
        await service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep);

      // assert
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
