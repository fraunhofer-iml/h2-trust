/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  ProcessStepEntity,
  ProvenanceEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { CalculationTopic, EnergySource, POWER_EMISSION_FACTORS, UNIT_G_CO2_PER_KG_H2 } from '@h2-trust/domain';
import {
  BatchEntityFixture,
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
  TransportationDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { EmissionService } from './emission.service';

describe('EmissionService', () => {
  let service: EmissionService;
  let generalSvcMock: { send: jest.Mock };

  beforeEach(async () => {
    generalSvcMock = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
      ],
    }).compile();

    service = module.get<EmissionService>(EmissionService);
  });

  describe('computeProvenanceEmissions', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        givenHydrogenBottling
      );

      // Act
      const actualResult = await service.computeProvenanceEmissions(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculations.length).toBeGreaterThan(0);
    });

    it('computes emissions including water consumptions', async () => {
      // Arrange
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        givenHydrogenBottling,
        undefined,
        [givenWaterConsumption]);

      // Act
      const actualResult = await service.computeProvenanceEmissions(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.calculations.some((c) => c.name?.includes('Water'))).toBe(true);
    });

    it('computes emissions including hydrogen productions', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        givenHydrogenBottling,
        [givenHydrogenProduction]
      );

      // Act
      const actualResult = await service.computeProvenanceEmissions(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.calculations.some((c) => c.name?.includes('Compression'))).toBe(true);
    });

    it('computes emissions including hydrogen transportation with pipeline', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails: TransportationDetailsEntityFixture.createPipeline(),
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenTransportation,
        givenHydrogenBottling
      );

      // Act
      const actualResult = await service.computeProvenanceEmissions(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.calculations.some((c) => c.name?.includes('Pipeline'))).toBe(true);
    });

    it('computes emissions including hydrogen transportation with trailer', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails: TransportationDetailsEntityFixture.createTrailer(),
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenTransportation,
        givenHydrogenBottling
      );

      // Act
      const actualResult = await service.computeProvenanceEmissions(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.calculations.some((c) => c.name?.includes('Trailer'))).toBe(true);
    });

    it('throws error when provenance is undefined', async () => {
      // Arrange
      const givenProvenance = undefined as unknown as ProvenanceEntity;

      const expectedErrorMessage = 'Provenance is undefined.';

      // Act & Assert
      await expect(service.computeProvenanceEmissions(givenProvenance))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when provenance is missing hydrogen bottling', async () => {
      // Arrange
      const givenRoot = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenRoot, undefined);

      const expectedErrorMessage = 'Provenance is missing hydrogen bottling process step.';

      // Act & Assert
      await expect(service.computeProvenanceEmissions(givenProvenance))
        .rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('computePowerSupplyEmissions', () => {
    it('returns empty array when power productions is empty', async () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await service.computePowerSupplyEmissions(givenPowerProductions, givenHydrogenAmount);

      // Assert
      expect(actualResult).toEqual([]);
    });

    it('computes emissions for single power production with solar energy', async () => {
      // Arrange
      const givenUnit = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createSolarEnergy(),
      });
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit,
        batch: BatchEntityFixture.createPowerBatch({ amount: 500 }),
      });
      const givenHydrogenAmount = 100;

      generalSvcMock.send.mockReturnValue(of([givenUnit]));

      const expectedEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.SOLAR_ENERGY];
      const expectedResult = (givenProcessStep.batch.amount * expectedEmissionFactor.emissionFactor) / givenHydrogenAmount;

      // Act
      const actualResult = await service.computePowerSupplyEmissions([givenProcessStep], givenHydrogenAmount);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].name).toEqual(expectedEmissionFactor.label);
      expect(actualResult[0].result).toEqual(expectedResult);
      expect(actualResult[0].unit).toEqual(UNIT_G_CO2_PER_KG_H2);
      expect(actualResult[0].calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);

      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS,
        expect.objectContaining({ ids: [givenProcessStep.executedBy.id] }),
      );
    });

    it('computes emissions for multiple power productions with different energy sources', async () => {
      // Arrange
      const givenHydrogenAmount = 100;

      const givenSolarUnit = PowerProductionUnitEntityFixture.create({
        id: 'solar-unit',
        type: PowerProductionTypeEntityFixture.createSolarEnergy(),
      });
      const givenGridUnit = PowerProductionUnitEntityFixture.create({
        id: 'grid-unit',
        type: PowerProductionTypeEntityFixture.createGrid(),
      });

      const givenSolarProcessStep = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenSolarUnit,
        batch: BatchEntityFixture.createPowerBatch({ amount: 300 }),
      });
      const givenGridProcessStep = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenGridUnit,
        batch: BatchEntityFixture.createPowerBatch({ amount: 200 }),
      });

      generalSvcMock.send.mockReturnValue(of([givenSolarUnit, givenGridUnit]));

      const expectedSolarEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.SOLAR_ENERGY];
      const expectedSolarResult = (givenSolarProcessStep.batch.amount * expectedSolarEmissionFactor.emissionFactor) / givenHydrogenAmount;

      const expectedGridEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID];
      const expectedGridResult = (givenGridProcessStep.batch.amount * expectedGridEmissionFactor.emissionFactor) / givenHydrogenAmount;
      // Act
      const actualResult = await service.computePowerSupplyEmissions(
        [givenSolarProcessStep, givenGridProcessStep],
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toHaveLength(2);

      expect(actualResult[0].name).toEqual(expectedSolarEmissionFactor.label);
      expect(actualResult[0].result).toEqual(expectedSolarResult);
      expect(actualResult[0].unit).toEqual(UNIT_G_CO2_PER_KG_H2);
      expect(actualResult[0].calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);

      expect(actualResult[1].name).toEqual(expectedGridEmissionFactor.label);
      expect(actualResult[1].result).toEqual(expectedGridResult);
      expect(actualResult[1].unit).toEqual(UNIT_G_CO2_PER_KG_H2);
      expect(actualResult[1].calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);


      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS,
        expect.objectContaining({ ids: [givenSolarProcessStep.executedBy.id, givenGridProcessStep.executedBy.id] }),
      );
    });

    it('deduplicates unit IDs when same unit is used multiple times', async () => {
      // Arrange
      const givenHydrogenAmount = 100;

      const givenUnit = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createGrid(),
      });
      const givenProcessStep1 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit,
        batch: BatchEntityFixture.createPowerBatch({ amount: 300 }),
      });
      const givenProcessStep2 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit,
        batch: BatchEntityFixture.createPowerBatch({ amount: 200 }),
      });

      generalSvcMock.send.mockReturnValue(of([givenUnit]));

      const expectedEmissionFactor = POWER_EMISSION_FACTORS[EnergySource.GRID];
      const expectedResult1 = (givenProcessStep1.batch.amount * expectedEmissionFactor.emissionFactor) / givenHydrogenAmount;
      const expectedResult2 = (givenProcessStep2.batch.amount * expectedEmissionFactor.emissionFactor) / givenHydrogenAmount;

      // Act
      const actualResult = await service.computePowerSupplyEmissions(
        [givenProcessStep1, givenProcessStep2],
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toHaveLength(2);

      expect(actualResult[0].name).toEqual(expectedEmissionFactor.label);
      expect(actualResult[0].result).toEqual(expectedResult1);
      expect(actualResult[0].unit).toEqual(UNIT_G_CO2_PER_KG_H2);
      expect(actualResult[0].calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);


      expect(actualResult[1].name).toEqual(expectedEmissionFactor.label);
      expect(actualResult[1].result).toEqual(expectedResult2);
      expect(actualResult[1].unit).toEqual(UNIT_G_CO2_PER_KG_H2);
      expect(actualResult[1].calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);

      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS,
        expect.objectContaining({ ids: [givenUnit.id] }),
      );
    });

    it('throws error when power production unit is not found', async () => {
      // Arrange
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenAmount = 100;

      generalSvcMock.send.mockReturnValue(of([]));

      const expectedErrorMessage = `PowerProductionUnit [${givenPowerProduction.executedBy.id}] not found.`;

      // Act & Assert
      await expect(service.computePowerSupplyEmissions([givenPowerProduction], givenHydrogenAmount))
        .rejects.toThrow(expectedErrorMessage);
    });
  });
});
