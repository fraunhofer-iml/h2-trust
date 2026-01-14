/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import {
  ProcessStepEntityFixture,
  PowerProductionUnitEntityFixture,
  ProofOfSustainabilityEmissionCalculationEntityFixture,
} from '@h2-trust/fixtures/entities';
import {
  BrokerQueues,
  PowerProductionTypeEntity,
  ProcessStepEntity,
  ProofOfOriginPowerBatchEntity,
} from '@h2-trust/amqp';
import { BatchType, EnergySource, HydrogenColor, MeasurementUnit, PowerProductionType } from '@h2-trust/domain';

import { PowerSupplyClassificationService } from './power-supply-classification.service';
import { EmissionService } from './emission.service';

describe('PowerSupplyClassificationService', () => {
  let service: PowerSupplyClassificationService;

  const generalSvcMock = {
    send: jest.fn(),
  };

  const emissionServiceMock = {
    computePowerSupplyEmissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PowerSupplyClassificationService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: EmissionService,
          useValue: emissionServiceMock,
        },
      ],
    }).compile();

    service = module.get<PowerSupplyClassificationService>(PowerSupplyClassificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildPowerSupplySubClassifications', () => {
    it('returns sub-classifications grouped by energy source', async () => {
      // Arrange
      const givenSolarPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      givenSolarPowerProduction.id = 'solar-production'
      givenSolarPowerProduction.executedBy.id = 'solar-unit';

      const givenWindPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      givenWindPowerProduction.id = 'wind-production'
      givenWindPowerProduction.executedBy.id = 'wind-unit';

      const givenPowerProductions = [givenSolarPowerProduction, givenWindPowerProduction];
      const givenHydrogenAmount = 100;

      const givenPowerProductionTypes = [
        new PowerProductionTypeEntity(PowerProductionType.PHOTOVOLTAIC_SYSTEM, EnergySource.SOLAR_ENERGY, HydrogenColor.GREEN),
        new PowerProductionTypeEntity(PowerProductionType.WIND_TURBINE, EnergySource.WIND_ENERGY, HydrogenColor.GREEN),
      ];

      const givenSolarUnit = PowerProductionUnitEntityFixture.create({
        id: givenSolarPowerProduction.executedBy.id,
        type: givenPowerProductionTypes[0],
      });
      const givenWindUnit = PowerProductionUnitEntityFixture.create({
        id: givenWindPowerProduction.executedBy.id,
        type: givenPowerProductionTypes[1],
      });

      const givenEmissionCalculation = ProofOfSustainabilityEmissionCalculationEntityFixture.create();

      generalSvcMock.send
        .mockReturnValueOnce(of(givenPowerProductionTypes))
        .mockReturnValueOnce(of(givenSolarUnit))
        .mockReturnValueOnce(of(givenWindUnit));

      emissionServiceMock.computePowerSupplyEmissions.mockResolvedValue([givenEmissionCalculation]);

      // Act
      const actualResult = await service.buildPowerSupplySubClassifications(
        givenPowerProductions,
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toHaveLength(2);

      const solarSubClassification = actualResult.find((sc) => sc.name === EnergySource.SOLAR_ENERGY);
      expect(solarSubClassification).toBeDefined();
      expect(solarSubClassification.unit).toBe(MeasurementUnit.POWER);
      expect(solarSubClassification.classificationType).toBe(BatchType.POWER);
      expect(solarSubClassification.batches).toHaveLength(1);

      const solarBatch = solarSubClassification.batches[0] as ProofOfOriginPowerBatchEntity;
      expect(solarBatch.id).toBe(givenSolarPowerProduction.batch.id);
      expect(solarBatch.energySource).toBe(EnergySource.SOLAR_ENERGY);

      const windSubClassification = actualResult.find((sc) => sc.name === EnergySource.WIND_ENERGY);
      expect(windSubClassification).toBeDefined();
      expect(windSubClassification.batches).toHaveLength(1);

      const windBatch = windSubClassification.batches[0] as ProofOfOriginPowerBatchEntity;
      expect(windBatch.id).toBe(givenWindPowerProduction.batch.id);
      expect(windBatch.energySource).toBe(EnergySource.WIND_ENERGY);
    });

    it('returns empty array when no power productions provided', async () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await service.buildPowerSupplySubClassifications(
        givenPowerProductions,
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toEqual([]);
      expect(generalSvcMock.send).not.toHaveBeenCalled();
      expect(emissionServiceMock.computePowerSupplyEmissions).not.toHaveBeenCalled();
    });

    it('returns empty array when power productions is undefined', async () => {
      // Arrange
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await service.buildPowerSupplySubClassifications(
        undefined,
        givenHydrogenAmount
      );

      // Assert
      expect(actualResult).toEqual([]);
      expect(generalSvcMock.send).not.toHaveBeenCalled();
      expect(emissionServiceMock.computePowerSupplyEmissions).not.toHaveBeenCalled();
    });
  });
});
