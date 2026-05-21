/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProvenanceEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
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

    it('resolves hydrogen leaf and root productions across a multi-step hydrogen chain', () => {
      // Arrange
      const givenRootHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'root-hydrogen-production',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'root-hydrogen-batch',
          processStepId: 'root-hydrogen-production',
          predecessors: [
            BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' }),
            BatchEntityFixture.createWaterBatch({ id: 'water-batch-1', processStepId: 'water-consumption-1' }),
          ],
        }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenLeafHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'leaf-hydrogen-production',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'leaf-hydrogen-batch',
          processStepId: 'leaf-hydrogen-production',
          predecessors: [givenRootHydrogenProduction.batch],
        }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction({
        id: 'power-production-1',
        batch: BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' }),
        executedBy: PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      });
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption({
        id: 'water-consumption-1',
        batch: BatchEntityFixture.createWaterBatch({ id: 'water-batch-1', processStepId: 'water-consumption-1' }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'bottling-batch-1',
          processStepId: 'process-step-4',
          predecessors: [givenLeafHydrogenProduction.batch],
        }),
      });

      // Act
      const actualResult = buildProvenance(givenHydrogenBottling, [
        givenHydrogenBottling,
        givenLeafHydrogenProduction,
        givenRootHydrogenProduction,
        givenPowerProduction,
        givenWaterConsumption,
      ]);

      // Assert
      expect(actualResult.hydrogenBottling).toBe(givenHydrogenBottling);
      expect(actualResult.productionChains).toHaveLength(1);
      expect(actualResult.productionChains[0]).toEqual(
        expect.objectContaining({
          hydrogenLeafProduction: givenLeafHydrogenProduction,
          hydrogenRootProduction: givenRootHydrogenProduction,
          powerProduction: givenPowerProduction,
          waterConsumption: givenWaterConsumption,
        }),
      );
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([givenRootHydrogenProduction]);
    });

    it('throws when a hydrogen bottling root has no bottling process step in the predecessor set', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();

      // Act & Assert
      expect(() =>
        buildProvenance(givenProcessStep, [ProcessStepEntityFixture.createHydrogenProduction()]),
      ).toThrow(`Missing hydrogen bottling for root production [${givenProcessStep.id}].`);
    });

    it('throws when the resolved hydrogen root production is missing a water predecessor', () => {
      // Arrange
      const givenRootHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'root-hydrogen-production',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'root-hydrogen-batch',
          processStepId: 'root-hydrogen-production',
          predecessors: [BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' })],
        }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction({
        id: 'power-production-1',
        batch: BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' }),
        executedBy: PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      });

      // Act & Assert
      expect(() => buildProvenance(givenRootHydrogenProduction, [givenRootHydrogenProduction, givenPowerProduction])).toThrow(
        `Missing water consumption predecessor for root production [${givenRootHydrogenProduction.id}].`,
      );
    });
  });
});
