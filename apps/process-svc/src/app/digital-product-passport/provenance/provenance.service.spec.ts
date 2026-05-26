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

describe('Provenance', () => {
  describe('buildProvenance', () => {
    it('should throw error when process step is not found', () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenProcessStep.type = undefined;

      // act & assert
      const actualOperation = () => buildProvenance(givenProcessStep, []);

      expect(actualOperation).toThrow('Invalid process step.');
    });

    it(`should return ProvenanceEntity when the process type is ${ProcessType.POWER_PRODUCTION}`, () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      // act
      const actualResult: ProvenanceEntity = buildProvenance(givenProcessStep, []);

      // assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`should return ProvenanceEntity when the process type is ${ProcessType.WATER_CONSUMPTION}`, () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createWaterConsumption();

      // act
      const actualResult: ProvenanceEntity = buildProvenance(givenProcessStep, []);

      // assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([]);
      expect(actualResult.getAllWaterConsumptions()).toEqual([]);
      expect(actualResult.getAllPowerProductions()).toEqual([]);
    });

    it(`should return ProvenanceEntity when the process type is ${ProcessType.HYDROGEN_PRODUCTION}`, () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        ...givenPowerProductions,
        ...givenWaterConsumptions,
      ]);

      // assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBeUndefined();
      expect(actualResult.getAllHydrogenRootProductions()).toEqual([givenProcessStep]);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });

    it(`should return ProvenanceEntity when the process type is ${ProcessType.HYDROGEN_BOTTLING}`, () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        ...givenHydrogenProductions,
        ...givenWaterConsumptions,
        ...givenPowerProductions,
      ]);

      // assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenProcessStep);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });

    it(`should return ProvenanceEntity when the process type is ${ProcessType.HYDROGEN_TRANSPORTATION}`, () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      // act
      const actualResult = buildProvenance(givenProcessStep, [
        givenProcessStep,
        givenHydrogenBottling,
        ...givenHydrogenProductions,
        ...givenPowerProductions,
        ...givenWaterConsumptions,
      ]);

      // assert
      expect(actualResult.root).toBe(givenProcessStep);
      expect(actualResult.hydrogenBottling).toBe(givenHydrogenBottling);
      expect(actualResult.getAllHydrogenRootProductions()).toEqual(givenHydrogenProductions);
      expect(actualResult.getAllWaterConsumptions()).toEqual(givenWaterConsumptions);
      expect(actualResult.getAllPowerProductions()).toEqual(givenPowerProductions);
    });

    it('should resolve hydrogen leaf and root productions across a multi-step hydrogen chain when called', () => {
      // arrange
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

      // act
      const actualResult = buildProvenance(givenHydrogenBottling, [
        givenHydrogenBottling,
        givenLeafHydrogenProduction,
        givenRootHydrogenProduction,
        givenPowerProduction,
        givenWaterConsumption,
      ]);

      // assert
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

    it('should throw when a hydrogen bottling root has no bottling process step in the predecessor set', () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();

      // act & assert
      const actualOperation = () =>
        buildProvenance(givenProcessStep, [ProcessStepEntityFixture.createHydrogenProduction()]);

      expect(actualOperation).toThrow(`Missing hydrogen bottling for root production [${givenProcessStep.id}].`);
    });

    it('should throw when the resolved hydrogen root production is missing a water predecessor', () => {
      // arrange
      const givenRootHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'root-hydrogen-production',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'root-hydrogen-batch',
          processStepId: 'root-hydrogen-production',
          predecessors: [
            BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' }),
          ],
        }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction({
        id: 'power-production-1',
        batch: BatchEntityFixture.createPowerBatch({ id: 'power-batch-1', processStepId: 'power-production-1' }),
        executedBy: PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      });

      // act & assert
      const actualOperation = () =>
        buildProvenance(givenRootHydrogenProduction, [givenRootHydrogenProduction, givenPowerProduction]);

      expect(actualOperation).toThrow(
        `Missing water consumption predecessor for root production [${givenRootHydrogenProduction.id}].`,
      );
    });
  });
});
