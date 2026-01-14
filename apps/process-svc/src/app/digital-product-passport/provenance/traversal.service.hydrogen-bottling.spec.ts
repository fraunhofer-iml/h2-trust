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

  describe('fetchHydrogenProductionsFromHydrogenBottling', () => {
    it(`throws error when process step is not ${ProcessType.HYDROGEN_BOTTLING} type`, async () => {
      // Arrange
      const givenWrongProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${givenWrongProcessStep.id} (${givenWrongProcessStep.type})`;

      // Act & Assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenWrongProcessStep))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when hydrogenBottling has no predecessors', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      givenHydrogenBottling.batch.predecessors = [];

      const expectedErrorMessage = `No predecessors found for process step [${givenHydrogenBottling.id}]`;

      // Act & Assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenHydrogenBottling))
        .rejects.toThrow(expectedErrorMessage);
    });

    it(`throws error when predecessor is not ${ProcessType.HYDROGEN_PRODUCTION} type`, async () => {
      // Arrange
      const givenWrongPredecessor = ProcessStepEntityFixture.createPowerProduction();
      const givenWrongBatch = BatchEntityFixture.createPowerBatch({ processStepId: givenWrongPredecessor.id });

      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      givenHydrogenBottling.batch.predecessors = [givenWrongBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenWrongPredecessor);

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${givenWrongPredecessor.id} (${givenWrongPredecessor.type})`;

      // Act & Assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenHydrogenBottling))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when number of process steps does not match number of predecessor batches', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      const givenHydrogenBatch1 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-1', processStepId: givenHydrogenProduction.id });
      const givenHydrogenBatch2 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-2', processStepId: 'non-existent-step' });

      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      givenHydrogenBottling.batch.predecessors = [givenHydrogenBatch1, givenHydrogenBatch2];

      processStepServiceMock.readProcessStep.mockImplementation((id) => {
        if (id === givenHydrogenProduction.id) return Promise.resolve(givenHydrogenProduction);
        return Promise.resolve(null);
      });

      const expectedErrorMessage = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

      // Act & Assert
      await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenHydrogenBottling))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('returns hydrogen production process steps from hydrogen bottling predecessors', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      const givenHydrogenBatch = BatchEntityFixture.createHydrogenBatch({ processStepId: givenHydrogenProduction.id });

      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      givenHydrogenBottling.batch.predecessors = [givenHydrogenBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenProduction);

      // Act
      const actualResult = await service.fetchHydrogenProductionsFromHydrogenBottling(givenHydrogenBottling);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenHydrogenBatch.processStepId);
      expect(actualResult).toEqual([givenHydrogenProduction]);
    });

    it('returns multiple hydrogen production process steps from hydrogen bottling with multiple predecessors', async () => {
      // Arrange
      const givenHydrogenProduction1 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-prod-1' });
      const givenHydrogenProduction2 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-prod-2' });

      const givenHydrogenBatch1 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-1', processStepId: givenHydrogenProduction1.id });
      const givenHydrogenBatch2 = BatchEntityFixture.createHydrogenBatch({ id: 'batch-2', processStepId: givenHydrogenProduction2.id });

      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      givenHydrogenBottling.batch.predecessors = [givenHydrogenBatch1, givenHydrogenBatch2];

      processStepServiceMock.readProcessStep.mockImplementation((id) => {
        if (id === givenHydrogenProduction1.id) {
          return Promise.resolve(givenHydrogenProduction1);
        }
        if (id === givenHydrogenProduction2.id) {
          return Promise.resolve(givenHydrogenProduction2);
        }
        return Promise.resolve(null);
      });

      // Act
      const actualResult = await service.fetchHydrogenProductionsFromHydrogenBottling(givenHydrogenBottling);

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult).toContainEqual(givenHydrogenProduction1);
      expect(actualResult).toContainEqual(givenHydrogenProduction2);
    });
  });
});
