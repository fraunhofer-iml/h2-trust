/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProvenanceEntity } from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { ProcessType } from '@h2-trust/domain';
import { buildProvenance } from './provenance.service';

describe('ProvenanceService', () => {
  describe('buildProvenance', () => {
    it('throws error when process step is not found', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenProcessStep.type = undefined;

      // Act & Assert
      expect(() => buildProvenance(givenProcessStep, [])).toThrow('Invalid process step.');
    });

    it(`returns ProvenanceEntity for ${ProcessType.POWER_PRODUCTION} process type`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      // Act
      const actualResult: ProvenanceEntity = buildProvenance(givenProcessStep, []);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.WATER_CONSUMPTION} process type`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createWaterConsumption();

      // Act
      const actualResult: ProvenanceEntity = buildProvenance(givenProcessStep, []);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_PRODUCTION} process type`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // Act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        ...givenPowerProductions,
        ...givenWaterConsumptions,
      ]);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([givenProcessStep]);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_BOTTLING} process type`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // Act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        ...givenHydrogenProductions,
        ...givenWaterConsumptions,
        ...givenPowerProductions,
      ]);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenProcessStep);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });

    it(`returns ProvenanceEntity for ${ProcessType.HYDROGEN_TRANSPORTATION} process type`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // Act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        givenHydrogenBottling,
        ...givenHydrogenProductions,
        ...givenPowerProductions,
        ...givenWaterConsumptions,
      ]);

      // Assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenHydrogenBottling);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });
  });
});
