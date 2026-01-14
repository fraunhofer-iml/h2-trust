/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ProcessStepEntityFixture,
  ProofOfOriginClassificationEntityFixture,
  ProofOfOriginSubClassificationEntityFixture,
} from '@h2-trust/fixtures/entities';
import { ProofOfOrigin } from '@h2-trust/domain';

import { HydrogenProductionSectionService } from './hydrogen-production-section.service';
import { PowerSupplyClassificationService } from './power-supply-classification.service';
import { WaterSupplyClassificationService } from './water-supply-classification.service';
import { ProcessStepEntity } from '@h2-trust/amqp';

describe('HydrogenProductionSectionService', () => {
  let service: HydrogenProductionSectionService;

  const powerSupplyClassificationServiceMock = {
    buildPowerSupplySubClassifications: jest.fn(),
  };

  const waterSupplyClassificationServiceMock = {
    buildWaterSupplyClassification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HydrogenProductionSectionService,
        {
          provide: PowerSupplyClassificationService,
          useValue: powerSupplyClassificationServiceMock,
        },
        {
          provide: WaterSupplyClassificationService,
          useValue: waterSupplyClassificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<HydrogenProductionSectionService>(HydrogenProductionSectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildSection', () => {
    it('returns section with power supply and water supply classifications', async () => {
      // Arrange
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenHydrogenAmount = 100;

      const givenPowerSubClassifications = [ProofOfOriginSubClassificationEntityFixture.create()];
      const givenWaterSupplyClassification = ProofOfOriginClassificationEntityFixture.create({
        name: ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      });

      powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications.mockResolvedValue(givenPowerSubClassifications);
      waterSupplyClassificationServiceMock.buildWaterSupplyClassification.mockReturnValue(givenWaterSupplyClassification);

      // Act
      const actualResult = await service.buildSection(givenPowerProductions, givenWaterConsumptions, givenHydrogenAmount);

      // Assert
      expect(powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications).toHaveBeenCalledWith(
        givenPowerProductions,
        givenHydrogenAmount,
      );
      expect(waterSupplyClassificationServiceMock.buildWaterSupplyClassification).toHaveBeenCalledWith(
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
      expect(actualResult.classifications[0].subClassifications).toEqual(givenPowerSubClassifications);
      expect(actualResult.classifications[1]).toEqual(givenWaterSupplyClassification);
    });

    it('returns section with only power supply classification when no water consumptions', async () => {
      // Arrange
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];
      const givenWaterConsumptions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      const givenPowerSubClassifications = [ProofOfOriginSubClassificationEntityFixture.create()];

      powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications.mockResolvedValue(givenPowerSubClassifications);

      // Act
      const actualResult = await service.buildSection(givenPowerProductions, givenWaterConsumptions, givenHydrogenAmount);

      // Assert
      expect(powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications).toHaveBeenCalledWith(
        givenPowerProductions,
        givenHydrogenAmount,
      );
      expect(waterSupplyClassificationServiceMock.buildWaterSupplyClassification).not.toHaveBeenCalled();

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(1);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
    });

    it('returns section with only water supply classification when no power productions', async () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenHydrogenAmount = 100;

      const givenWaterSupplyClassification = ProofOfOriginClassificationEntityFixture.create({
        name: ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      });

      waterSupplyClassificationServiceMock.buildWaterSupplyClassification.mockReturnValue(givenWaterSupplyClassification);

      // Act
      const actualResult = await service.buildSection(givenPowerProductions, givenWaterConsumptions, givenHydrogenAmount);

      // Assert
      expect(powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications).not.toHaveBeenCalled();
      expect(waterSupplyClassificationServiceMock.buildWaterSupplyClassification).toHaveBeenCalledWith(
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(1);
      expect(actualResult.classifications[0]).toEqual(givenWaterSupplyClassification);
    });

    it('returns section with empty classifications when no power productions and no water consumptions', async () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenWaterConsumptions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await service.buildSection(givenPowerProductions, givenWaterConsumptions, givenHydrogenAmount);

      // Assert
      expect(powerSupplyClassificationServiceMock.buildPowerSupplySubClassifications).not.toHaveBeenCalled();
      expect(waterSupplyClassificationServiceMock.buildWaterSupplyClassification).not.toHaveBeenCalled();

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });
  });
});
