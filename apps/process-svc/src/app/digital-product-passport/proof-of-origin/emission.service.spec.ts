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
import {
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
      await expect(service.computeProvenanceEmissions(givenProvenance)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when provenance is missing hydrogen bottling', async () => {
      // Arrange
      const givenRoot = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenRoot, undefined);

      const expectedErrorMessage = 'Provenance is missing hydrogen bottling process step.';

      // Act & Assert
      await expect(service.computeProvenanceEmissions(givenProvenance)).rejects.toThrow(expectedErrorMessage);
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

    it('computes emissions for single power production', async () => {
      // Arrange
      const givenUnit = PowerProductionUnitEntityFixture.create();
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenAmount = 100;

      generalSvcMock.send.mockReturnValue(of([givenUnit]));

      // Act
      const actualResult = await service.computePowerSupplyEmissions([givenProcessStep], givenHydrogenAmount);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS,
        expect.objectContaining({ ids: [givenProcessStep.executedBy.id] }),
      );
    });

    it('computes emissions for multiple power productions with different units', async () => {
      // Arrange
      const givenUnit1 = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createSolarEnergy(),
      });
      const givenUnit2 = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createWindEnergy(),
      });
      const givenProcessStep1 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit1
      });
      const givenProcessStep2 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit2
      });
      const givenHydrogenAmount = 100;

      generalSvcMock.send.mockReturnValue(of([givenUnit1, givenUnit2]));

      // Act
      const actualResult = await service.computePowerSupplyEmissions([givenProcessStep1, givenProcessStep2], givenHydrogenAmount);

      // Assert
      expect(actualResult).toHaveLength(2);
    });

    it('deduplicates unit IDs when same unit is used multiple times', async () => {
      // Arrange
      const givenUnit = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createGrid(),
      });
      const givenPowerProduction1 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit
      });
      const givenPowerProduction2 = ProcessStepEntityFixture.createPowerProduction({
        executedBy: givenUnit
      });
      const givenHydrogenAmount = 100;

      generalSvcMock.send.mockReturnValue(of([givenUnit]));

      // Act
      const actualResult = await service.computePowerSupplyEmissions([givenPowerProduction1, givenPowerProduction2], givenHydrogenAmount);

      // Assert
      expect(actualResult).toHaveLength(2);
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
