/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BatchEntityFixture, ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { ProcessStepService } from '../../process-step/process-step.service';

describe('TraversalService', () => {
  let service: TraversalService;

  const processStepServiceMock = {
    readProcessStep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TraversalService,
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
      ],
    }).compile();

    service = module.get<TraversalService>(TraversalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchHydrogenBottlingFromHydrogenTransportation', () => {
    it(`throws error when process step is not ${ProcessType.HYDROGEN_TRANSPORTATION} type`, async () => {
      // Arrange
      const givenWrongProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_TRANSPORTATION}], but found invalid types: ${givenWrongProcessStep.id} (${givenWrongProcessStep.type})`;

      // Act & Assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenWrongProcessStep))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when hydrogenTransportation has no predecessors', async () => {
      // Arrange
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      givenHydrogenTransportation.batch.predecessors = [];

      const expectedErrorMessage = `No predecessors found for process step [${givenHydrogenTransportation.id}]`;

      // Act & Assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenHydrogenTransportation))
        .rejects.toThrow(expectedErrorMessage);
    });

    it(`throws error when predecessor is not ${ProcessType.HYDROGEN_BOTTLING} type`, async () => {
      // Arrange
      const givenWrongPredecessor = ProcessStepEntityFixture.createHydrogenProduction();
      const givenWrongBatch = BatchEntityFixture.createHydrogenBatch({ processStepId: givenWrongPredecessor.id });

      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      givenHydrogenTransportation.batch.predecessors = [givenWrongBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenWrongPredecessor);

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${givenWrongPredecessor.id} (${givenWrongPredecessor.type})`;

      // Act & Assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenHydrogenTransportation))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when more than one hydrogen bottling predecessor is found', async () => {
      // Arrange
      const givenHydrogenBottling1 = ProcessStepEntityFixture.createHydrogenBottling({ id: 'bottling-1' });
      const givenHydrogenBottling2 = ProcessStepEntityFixture.createHydrogenBottling({ id: 'bottling-2' });

      const givenHydrogenBatch1 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-1', processStepId: givenHydrogenBottling1.id });
      const givenHydrogenBatch2 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-2', processStepId: givenHydrogenBottling2.id });

      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      givenHydrogenTransportation.batch.predecessors = [givenHydrogenBatch1, givenHydrogenBatch2];

      processStepServiceMock.readProcessStep.mockImplementation((id) => {
        if (id === givenHydrogenBottling1.id) {
          return Promise.resolve(givenHydrogenBottling1)
        };
        if (id === givenHydrogenBottling2.id) {
          return Promise.resolve(givenHydrogenBottling2)
        };
        return Promise.resolve(null);
      });

      const expectedErrorMessage = `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [2].`;

      // Act & Assert
      await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenHydrogenTransportation))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('returns hydrogen bottling process step from hydrogen transportation predecessor', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenBatch = BatchEntityFixture.createHydrogenBatch({ processStepId: givenHydrogenBottling.id });

      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      givenHydrogenTransportation.batch.predecessors = [givenHydrogenBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenBottling);

      // Act
      const actualResult = await service.fetchHydrogenBottlingFromHydrogenTransportation(givenHydrogenTransportation);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenHydrogenBatch.processStepId);
      expect(actualResult).toBe(givenHydrogenBottling);
    });
  });
});
