/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProductionChainEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { CalculationTopic } from '@h2-trust/domain';
import { ProcessStepEntityFixture, TransportationDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { ProofOfSustainabilityService } from '../../proof-of-sustainability.service';
import { HydrogenBottlingPosService } from '../hydrogen-bottling-pos.service';
import { HydrogenProductionPosService } from '../hydrogen-production-pos.service';
import { HydrogenStoragePosService } from '../hydrogen-storage-pos.service';
import { HydrogenTransportPosService } from '../hydrogen-transport-pos.service';
import { PowerProductionPosService } from '../power-production-pos.service';
import { WaterConsumptionPosService } from '../water-consumption-pos.service';

describe('ProodOfSustainability', () => {
  describe('computeProvenanceEmissionsForHydrogenBottling', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult =
        await HydrogenBottlingPosService.computeProvenanceEmissionsForHydrogenBottling(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });
  });

  describe('computeProvenanceEmissionsForHydrogenProduction', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult =
        await HydrogenProductionPosService.computeProvenanceEmissionsForHydrogenProduction(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });
  });

  describe('computeEmissionsForHydrogenStorage', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      // Act
      const actualResult = await HydrogenStoragePosService.computeEmissionsForHydrogenStorage(givenHydrogenProduction);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });
  });

  describe('computeProvenanceEmissionsForTransport', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult = await HydrogenTransportPosService.computeProvenanceEmissionsForTransport(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });
  });

  describe('computeProvenanceEmissionsForPowerProduction', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult =
        await PowerProductionPosService.computeProvenanceEmissionsForPowerProduction(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });
  });

  describe('computeProvenanceEmissionsForWaterConsumption', () => {
    it('computes emissions for provenance with hydrogen bottling only', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult =
        await WaterConsumptionPosService.computeProvenanceEmissionsForWaterConsumption(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      //expect(actualResult.batchId).toBe(givenHydrogenBottling.id); // TODO-MP: batchId or processStepId -> DUHGW-314
      //expect(actualResult.calculations.length).toBeGreaterThan(0);
    });

    it('createProofOfSustainability', () => {
      // Arrange
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails: TransportationDetailsEntityFixture.createTrailer(),
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenTransportation,
        [
          new ProductionChainEntity(
            givenHydrogenProduction,
            givenHydrogenProduction,
            givenPowerProduction,
            givenWaterConsumption,
            givenPowerProduction.executedBy as PowerProductionUnitEntity,
            givenWaterConsumption.executedBy as HydrogenProductionUnitEntity,
          ),
        ],
        givenHydrogenBottling,
      );

      // Act
      const actualResult = ProofOfSustainabilityService.createProofOfSustainability(givenProvenance);

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.batchId).toBe(givenHydrogenTransportation.id);
      expect(actualResult.calculations.length).toBe(5);
      expect(actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.POWER_SUPPLY).length).toBe(
        1,
      );
      expect(actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.WATER_SUPPLY).length).toBe(
        1,
      );
      expect(
        actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_STORAGE).length,
      ).toBe(1);
      expect(
        actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_BOTTLING).length,
      ).toBe(1);
      expect(
        actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_TRANSPORTATION).length,
      ).toBe(1);
      expect(actualResult.emissions.length).toBe(8);
      expect(actualResult.emissions.filter((e) => e.emissionType === 'APPLICATION').length).toBe(5);
      expect(actualResult.emissions.filter((e) => e.emissionType === 'REGULATORY').length).toBe(3);
    });

    it('throws error when provenance is undefined', async () => {
      // Arrange
      const givenProvenance = undefined as unknown as ProvenanceEntity;

      const expectedErrorMessage = 'Provenance is undefined.';

      // Act & Assert
      await expect(ProofOfSustainabilityService.createProofOfSustainability(givenProvenance)).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });
});
