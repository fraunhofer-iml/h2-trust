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

  describe('fetchWaterConsumptionsFromHydrogenProductions', () => {
    it('throws error when hydrogenProductions is empty', async () => {
      // Arrange
      const givenHydrogenProductions: ProcessStepEntity[] = [];

      const expectedErrorMessage = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

      // Act & Assert
      await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenHydrogenProductions)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it(`throws error when process step is not ${ProcessType.HYDROGEN_PRODUCTION} type`, async () => {
      // Arrange
      const givenWrongProcessStep = ProcessStepEntityFixture.createWaterConsumption();
      const givenHydrogenProductions = [givenWrongProcessStep];

      const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${givenWrongProcessStep.id} (${givenWrongProcessStep.type})`;

      // Act & Assert
      await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenHydrogenProductions)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('throws error when hydrogenProduction has no predecessors', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProduction.batch.predecessors = [];

      const expectedErrorMessage = `No predecessors found for process step [${givenHydrogenProduction.id}]`;

      // Act & Assert
      await expect(service.fetchWaterConsumptionsFromHydrogenProductions([givenHydrogenProduction])).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('returns water consumption process steps from hydrogen production predecessors', async () => {
      // Arrange
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
      const givenWaterBatch = BatchEntityFixture.createWaterBatch({ processStepId: givenWaterConsumption.id });

      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProduction.batch.predecessors = [givenWaterBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenWaterConsumption);

      // Act
      const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions([givenHydrogenProduction]);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenWaterBatch.processStepId);
      expect(actualResult).toEqual([givenWaterConsumption]);
    });

    it('returns multiple water consumption process steps from multiple hydrogen productions', async () => {
      // Arrange
      const givenWaterConsumption1 = ProcessStepEntityFixture.createWaterConsumption({ id: 'water-step-1' });
      const givenWaterConsumption2 = ProcessStepEntityFixture.createWaterConsumption({ id: 'water-step-2' });

      const givenWaterBatch1 = BatchEntityFixture.createWaterBatch({
        id: 'batch-1',
        processStepId: givenWaterConsumption1.id,
      });
      const givenWaterBatch2 = BatchEntityFixture.createWaterBatch({
        id: 'batch-2',
        processStepId: givenWaterConsumption2.id,
      });

      const givenHydrogenProduction1 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-1' });
      const givenHydrogenProduction2 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-2' });

      givenHydrogenProduction1.batch.predecessors = [givenWaterBatch1];
      givenHydrogenProduction2.batch.predecessors = [givenWaterBatch2];

      processStepServiceMock.readProcessStep.mockImplementation((id) => {
        if (id === givenWaterConsumption1.id) {
          return Promise.resolve(givenWaterConsumption1);
        }
        if (id === givenWaterConsumption2.id) {
          return Promise.resolve(givenWaterConsumption2);
        }
        return Promise.resolve(null);
      });

      // Act
      const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions([
        givenHydrogenProduction1,
        givenHydrogenProduction2,
      ]);

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult).toContainEqual(givenWaterConsumption1);
      expect(actualResult).toContainEqual(givenWaterConsumption2);
    });

    it('deduplicates water consumptions when same water batch is predecessor of multiple hydrogen productions', async () => {
      // Arrange
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption({ id: 'water-step-1' });
      const givenWaterBatch = BatchEntityFixture.createWaterBatch({ processStepId: givenWaterConsumption.id });

      const givenHydrogenProduction1 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-1' });
      const givenHydrogenProduction2 = ProcessStepEntityFixture.createHydrogenProduction({ id: 'hydrogen-step-2' });

      givenHydrogenProduction1.batch.predecessors = [givenWaterBatch];
      givenHydrogenProduction2.batch.predecessors = [givenWaterBatch];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenWaterConsumption);

      // Act
      const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions([
        givenHydrogenProduction1,
        givenHydrogenProduction2,
      ]);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult).toEqual([givenWaterConsumption]);
    });
  });
});
