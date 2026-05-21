/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginPowerBatchEntity } from '@h2-trust/contracts/entities';
import {
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BatchType, EnergySource } from '@h2-trust/domain';
import { buildPowerSupplySubClassifications } from './power-production-classification.assembler';

describe('PowerProductionProofOfOriginAssembler', () => {
  describe('buildPowerSupplySubClassifications', () => {
    it('should return sub-classifications when power productions are grouped by energy source', async () => {
    // arrange
      const givenSolarPowerProduction = ProcessStepEntityFixture.createPowerProduction({
        executedBy: PowerProductionUnitEntityFixture.create({
          type: PowerProductionTypeEntityFixture.createSolarEnergy(),
        }),
      });
      givenSolarPowerProduction.id = 'solar-production';
      givenSolarPowerProduction.executedBy.id = 'solar-unit';

      const givenWindPowerProduction = ProcessStepEntityFixture.createPowerProduction({
        executedBy: PowerProductionUnitEntityFixture.create({
          type: PowerProductionTypeEntityFixture.createWindEnergy(),
        }),
      });
      givenWindPowerProduction.id = 'wind-production';
      givenWindPowerProduction.executedBy.id = 'wind-unit';

      const givenPowerProductions = [givenSolarPowerProduction, givenWindPowerProduction];
      const givenHydrogenAmount = 100;

      // act
      const actualResult = buildPowerSupplySubClassifications(givenPowerProductions, givenHydrogenAmount);

      // assert
      expect(actualResult).toHaveLength(2);

      const givenSolarSubClassification = actualResult.find((sc) => sc.name === EnergySource.SOLAR_ENERGY);
      expect(givenSolarSubClassification).toBeDefined();
      expect(givenSolarSubClassification.classificationType).toBe(BatchType.POWER);
      expect(givenSolarSubClassification.batches).toHaveLength(1);

      const givenSolarBatch = givenSolarSubClassification.batches[0] as ProofOfOriginPowerBatchEntity;
      expect(givenSolarBatch.id).toBe(givenSolarPowerProduction.batch.id);
      expect(givenSolarBatch.energySource).toBe(EnergySource.SOLAR_ENERGY);

      const givenWindSubClassification = actualResult.find((sc) => sc.name === EnergySource.WIND_ENERGY);
      expect(givenWindSubClassification).toBeDefined();
      expect(givenWindSubClassification.batches).toHaveLength(1);

      const givenWindBatch = givenWindSubClassification.batches[0] as ProofOfOriginPowerBatchEntity;
      expect(givenWindBatch.id).toBe(givenWindPowerProduction.batch.id);
      expect(givenWindBatch.energySource).toBe(EnergySource.WIND_ENERGY);
    });

    it('should return an empty array when no power productions are provided', async () => {
    // arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // act
      const actualResult = buildPowerSupplySubClassifications(givenPowerProductions, givenHydrogenAmount);

      // assert
      expect(actualResult).toEqual([]);
    });

    it('should return an empty array when power productions are undefined', async () => {
    // arrange
      const givenHydrogenAmount = 100;

      // act
      const actualResult = buildPowerSupplySubClassifications(undefined, givenHydrogenAmount);

      // assert
      expect(actualResult).toEqual([]);
    });
  });
});
