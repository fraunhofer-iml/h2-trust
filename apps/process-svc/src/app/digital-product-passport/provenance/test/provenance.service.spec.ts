/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceEntity } from '@h2-trust/contracts';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/testing';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepService } from '../../../process-step/process-step.service';
import { ProvenanceService } from '../provenance.service';
import { TraversalService } from '../traversal.service';

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
    getPredecessorsForBatch: jest.fn(),
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
    it('throws error when process step is not found', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenProcessStep.type = undefined;

      processStepServiceMock.readProcessStep.mockResolvedValue(null);

      // Act & Assert
      await expect(service.buildProvenance(givenProcessStep)).rejects.toThrow('Invalid process step.');
    });

    it(`returns ProvenanceEntity for ${ProcessType.POWER_PRODUCTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(givenProcessStep);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.WATER_CONSUMPTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createWaterConsumption();

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(givenProcessStep);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_PRODUCTION} process type`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      traversalServiceMock.fetchWaterConsumptionsFromHydrogenProductions.mockResolvedValue(givenWaterConsumptions);
      traversalServiceMock.fetchPowerProductionsFromHydrogenProductions.mockResolvedValue(givenPowerProductions);
      traversalServiceMock.getPredecessorsForBatch.mockReturnValue(
        Promise.resolve([...givenPowerProductions, ...givenWaterConsumptions]),
      );

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([givenProcessStep]);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
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
      traversalServiceMock.getPredecessorsForBatch.mockResolvedValue([
        ...givenWaterConsumptions,
        ...givenPowerProductions,
      ]);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep);

      // Assert
      expect(traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling).toHaveBeenCalledWith(givenProcessStep);

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenProcessStep);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
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
      traversalServiceMock.getPredecessorsForBatch.mockResolvedValue([
        ...givenWaterConsumptions,
        ...givenPowerProductions,
      ]);

      // Act
      const actualResult = await service.buildProvenance(givenProcessStep);

      // Assert
      expect(traversalServiceMock.fetchHydrogenBottlingFromHydrogenTransportation).toHaveBeenCalledWith(
        givenProcessStep,
      );
      expect(traversalServiceMock.fetchHydrogenProductionsFromHydrogenBottling).toHaveBeenCalledWith(
        givenHydrogenBottling,
      );

      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenHydrogenBottling);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });
  });
});
