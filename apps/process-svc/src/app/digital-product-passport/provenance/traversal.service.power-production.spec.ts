/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from '../../process-step/process-step.service';
import { TraversalService } from './traversal.service';

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

  describe('fetchPowerProductionsFromHydrogenProductions', () => {
    it('throws error when hydrogenProductions is empty', async () => {
      // Arrange
      const givenHydrogenProductions: ProcessStepEntity[] = [];

      const expectedErrorMessage = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

      // Act & Assert
      await expect(service.fetchPowerProductionsFromHydrogenProductions(givenHydrogenProductions)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it(`throws error when process step is not ${ProcessType.HYDROGEN_PRODUCTION} type`, async () => {
      // Arrange
      const givenWrongProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProductions = [givenWrongProcessStep];

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${givenWrongProcessStep.id} (${givenWrongProcessStep.type})`;

      // Act & Assert
      await expect(service.fetchPowerProductionsFromHydrogenProductions(givenHydrogenProductions)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('throws error when hydrogenProduction has no predecessors', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProduction.batch.predecessors = [];

      const expectedErrorMessage = `No predecessors found for process step [${givenHydrogenProduction.id}]`;

      // Act & Assert
      await expect(service.fetchPowerProductionsFromHydrogenProductions([givenHydrogenProduction])).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('returns power production process steps from hydrogen production predecessors', async () => {
      // Arrange
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      const givenPowerBatch = BatchEntityFixture.createPowerBatch({ processStepId: givenPowerProduction.id });

      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProduction.batch.predecessors = [givenPowerBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenPowerProduction);

      // Act
      const actualResult = await service.fetchPowerProductionsFromHydrogenProductions([givenHydrogenProduction]);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenPowerBatch.processStepId);
      expect(actualResult).toEqual([givenPowerProduction]);
    });

    it('returns multiple power production process steps from multiple hydrogen productions', async () => {
      // Arrange
      const givenPowerProduction1 = ProcessStepEntityFixture.createPowerProduction({ id: 'power-step-1' });
      const givenPowerProduction2 = ProcessStepEntityFixture.createPowerProduction({ id: 'power-step-2' });

      const givenPowerBatch1 = BatchEntityFixture.createPowerBatch({
        id: 'batch-1',
        processStepId: givenPowerProduction1.id,
      });
      const givenPowerBatch2 = BatchEntityFixture.createPowerBatch({
        id: 'batch-2',
        processStepId: givenPowerProduction2.id,
      });

      const givenHydrogenProduction1 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-1' });
      const givenHydrogenProduction2 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-2' });

      givenHydrogenProduction1.batch.predecessors = [givenPowerBatch1];
      givenHydrogenProduction2.batch.predecessors = [givenPowerBatch2];

      processStepServiceMock.readProcessStep.mockImplementation((id) => {
        if (id === givenPowerProduction1.id) {
          return Promise.resolve(givenPowerProduction1);
        }
        if (id === givenPowerProduction2.id) {
          return Promise.resolve(givenPowerProduction2);
        }
        return Promise.resolve(null);
      });

      // Act
      const actualResult = await service.fetchPowerProductionsFromHydrogenProductions([
        givenHydrogenProduction1,
        givenHydrogenProduction2,
      ]);

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult).toContainEqual(givenPowerProduction1);
      expect(actualResult).toContainEqual(givenPowerProduction2);
    });

    it('deduplicates power productions when same power batch is predecessor of multiple hydrogen productions', async () => {
      // Arrange
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      const givenPowerBatch = BatchEntityFixture.createPowerBatch({ processStepId: givenPowerProduction.id });

      const givenHydrogenProduction1 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-1' });
      const givenHydrogenProduction2 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-2' });

      givenHydrogenProduction1.batch.predecessors = [givenPowerBatch];
      givenHydrogenProduction2.batch.predecessors = [givenPowerBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenPowerProduction);

      // Act
      const actualResult = await service.fetchPowerProductionsFromHydrogenProductions([
        givenHydrogenProduction1,
        givenHydrogenProduction2,
      ]);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult).toEqual([givenPowerProduction]);
    });
  });
});
