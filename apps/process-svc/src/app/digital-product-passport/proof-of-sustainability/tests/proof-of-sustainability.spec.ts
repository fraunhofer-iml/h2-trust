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
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
  TransportationDetailsEntity,
} from '@h2-trust/contracts';
import { CalculationTopic } from '@h2-trust/domain';
import { ProcessStepEntityFixture, TransportationDetailsEntityFixture } from '@h2-trust/contracts/testing';
import { assembleHydrogenBottlingEmissions } from '../hydrogen-bottling-proof-of-sustainability.assembler';
import { assembleHydrogenProductionEmissions } from '../hydrogen-production-proof-of-sustainability.assembler';
import { computeHydrogenStorageEmissionCalculations } from '../hydrogen-storage-proof-of-sustainability.calculator';
import { assembleHydrogenTransportationEmissions } from '../hydrogen-transportation-proof-of-sustainability.assembler';
import { assemblePowerProductionEmissions } from '../power-production-proof-of-sustainability.assembler';
import { createProofOfSustainability } from '../proof-of-sustainability.service';
import { assembleWaterConsumptionEmissions } from '../water-consumption-proof-of-sustainability.assembler';

describe('ProofOfSustainability', () => {
  describe('computeProvenanceEmissionsForHydrogenBottling', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult: ProofOfSustainabilityEmissionCalculationEntity =
        assembleHydrogenBottlingEmissions(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.HYDROGEN_BOTTLING);
    });
  });

  describe('computeProvenanceEmissionsForHydrogenProduction', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult: ProofOfSustainabilityEmissionCalculationEntity =
        assembleHydrogenProductionEmissions(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.HYDROGEN_STORAGE);
    });
  });

  describe('computeEmissionsForHydrogenStorage', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      // Act
      const actualResult = computeHydrogenStorageEmissionCalculations(givenHydrogenProduction)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.HYDROGEN_STORAGE);
    });
  });

  describe('computeProvenanceEmissionsForTransport', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const transportationDetails: TransportationDetailsEntity = TransportationDetailsEntityFixture.createPipeline();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails,
      });
      const givenProvenance = new ProvenanceEntity(givenHydrogenTransportation, [], givenHydrogenBottling);

      // Act
      const actualResult = assembleHydrogenTransportationEmissions(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.HYDROGEN_TRANSPORTATION);
    });
  });

  describe('computeProvenanceEmissionsForPowerProduction', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult = assemblePowerProductionEmissions(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.POWER_SUPPLY);
    });
  });

  describe('computeProvenanceEmissionsForWaterConsumption', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [], givenHydrogenBottling);

      // Act
      const actualResult = assembleWaterConsumptionEmissions(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.WATER_SUPPLY);
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
      const actualResult = createProofOfSustainability(givenProvenance);

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
  });
});
