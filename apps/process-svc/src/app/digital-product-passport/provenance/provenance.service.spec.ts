/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from '../../process-step/process-step.service';
import { ProvenanceService } from './provenance.service';
import { TraversalService } from './traversal.service';

describe('ProvenanceService', () => {
  let service: ProvenanceService;

  const processStepServiceMock = {
    readProcessStep: jest.fn(),
  };

  const traversalServiceMock = {
    fetchWaterConsumptionsFromHydrogenProductions: jest.fn(),
    fetchPowerProductionsFromHydrogenProductions: jest.fn(),
    fetchHydrogenProductionsFromHydrogenBottling: jest.fn(),
    fetchHydrogenBottlingFromHydrogenTransportation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvenanceService,
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
        {
          provide: TraversalService,
          useValue: traversalServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProvenanceService>(ProvenanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildProvenance', () => {
    it('throws error when processStepId is not provided', async () => {
      // Arrange
      const givenProcessStepId = '';

      // Act & Assert
      await expect(service.buildProvenance(givenProcessStepId)).rejects.toThrow('processStepId must be provided.');
    });

    it('throws error when process step is not found', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';

      processStepServiceMock.readProcessStep.mockResolvedValue(null);

      // Act & Assert
      await expect(service.buildProvenance(givenProcessStepId)).rejects.toThrow('Invalid process step.');
    });

    it('throws error when process step type is invalid', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenProcessStep.type = 'INVALID_TYPE';

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);

      // Act & Assert
      await expect(service.buildProvenance(givenProcessStep.id)).rejects.toThrow(
        `Unsupported process type [${givenProcessStep.type}].`,
      );
    });

    it(`returns ProvenanceEntity for ${ProcessType.POWER_PRODUCTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.hydrogenProductions).toEqual([]);
      expect(actualResult.waterConsumptions).toEqual([]);
      expect(actualResult.powerProductions).toEqual([givenProcessStep]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.WATER_CONSUMPTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createWaterConsumption();

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.hydrogenProductions).toEqual([]);
      expect(actualResult.waterConsumptions).toEqual([givenProcessStep]);
      expect(actualResult.powerProductions).toEqual([]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_PRODUCTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions.mockResolvedValue(givenWaterConsumptions);
      traversalServiceMock.fetchPowerProductionsFromHydrogenProductions.mockResolvedValue(givenPowerProductions);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions).toHaveBeenCalledWith([
        givenProcessStep,
      ]);
      expect(traversalServiceMock.fetchPowerProductionsFromHydrogenProductions).toHaveBeenCalledWith([
        givenProcessStep,
      ]);

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.hydrogenProductions).toEqual([givenProcessStep]);
      expect(actualResult.waterConsumptions).toEqual(givenWaterConsumptions);
      expect(actualResult.powerProductions).toEqual(givenPowerProductions);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_BOTTLING} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling.mockResolvedValue(givenHydrogenProductions);
      traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions.mockResolvedValue(givenWaterConsumptions);
      traversalServiceMock.fetchPowerProductionsFromHydrogenProductions.mockResolvedValue(givenPowerProductions);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling).toHaveBeenCalledWith(givenProcessStep);
      expect(traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions).toHaveBeenCalledWith(
        givenHydrogenProductions,
      );
      expect(traversalServiceMock.fetchPowerProductionsFromHydrogenProductions).toHaveBeenCalledWith(
        givenHydrogenProductions,
      );

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenProcessStep);
      expect(actualResult.hydrogenProductions).toEqual(givenHydrogenProductions);
      expect(actualResult.waterConsumptions).toEqual(givenWaterConsumptions);
      expect(actualResult.powerProductions).toEqual(givenPowerProductions);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_TRANSPORTATION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      traversalServiceMock.fetchHydrogenBottlingFromHydrogenTransportation.mockResolvedValue(givenHydrogenBottling);
      traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling.mockResolvedValue(givenHydrogenProductions);
      traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions.mockResolvedValue(givenWaterConsumptions);
      traversalServiceMock.fetchPowerProductionsFromHydrogenProductions.mockResolvedValue(givenPowerProductions);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(traversalServiceMock.fetchHydrogenBottlingFromHydrogenTransportation).toHaveBeenCalledWith(
        givenProcessStep,
      );
      expect(traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling).toHaveBeenCalledWith(
        givenHydrogenBottling,
      );
      expect(traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions).toHaveBeenCalledWith(
        givenHydrogenProductions,
      );
      expect(traversalServiceMock.fetchPowerProductionsFromHydrogenProductions).toHaveBeenCalledWith(
        givenHydrogenProductions,
      );

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenHydrogenBottling);
      expect(actualResult.hydrogenProductions).toEqual(givenHydrogenProductions);
      expect(actualResult.waterConsumptions).toEqual(givenWaterConsumptions);
      expect(actualResult.powerProductions).toEqual(givenPowerProductions);
    });
  });
});
