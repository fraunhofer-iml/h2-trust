/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginPowerBatchEntity } from '@h2-trust/contracts';
import { BatchType, EnergySource } from '@h2-trust/domain';
import {
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/testing';
import { buildPowerSupplySubClassifications } from '../power-production-proof-of-origin.assembler';

describe('PowerProductionProofOfOriginAssembler', () => {
  describe('buildPowerSupplySubClassifications', () => {
    it('returns sub-classifications grouped by energy source', async () => {
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

      const actualResult = buildPowerSupplySubClassifications(givenPowerProductions, givenHydrogenAmount);

      expect(actualResult).toHaveLength(2);

      const solarSubClassification = actualResult.find((sc) => sc.name === EnergySource.SOLAR_ENERGY);
      expect(solarSubClassification).toBeDefined();
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
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      const actualResult = buildPowerSupplySubClassifications(givenPowerProductions, givenHydrogenAmount);

      expect(actualResult).toEqual([]);
    });

    it('returns empty array when power productions is undefined', async () => {
      const givenHydrogenAmount = 100;

      const actualResult = buildPowerSupplySubClassifications(undefined, givenHydrogenAmount);

      expect(actualResult).toEqual([]);
    });
  });
});
