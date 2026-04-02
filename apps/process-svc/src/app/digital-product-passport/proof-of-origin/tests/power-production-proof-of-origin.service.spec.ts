/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginPowerBatchEntity } from '@h2-trust/amqp';
import { BatchType, EnergySource } from '@h2-trust/domain';
import {
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/fixtures/entities';
import { PowerProductionProofOfOriginService } from '../power-production-proof-of-origin.service';

describe('PowerProductionProofOfOriginService', () => {
  describe('buildPowerSupplySubClassifications', () => {
    it('returns sub-classifications grouped by energy source', async () => {
      // Arrange
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

      // Act
      const actualResult = await PowerProductionProofOfOriginService.buildPowerSupplySubClassifications(
        givenPowerProductions,
        givenHydrogenAmount,
      );

      // Assert
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
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await PowerProductionProofOfOriginService.buildPowerSupplySubClassifications(
        givenPowerProductions,
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toEqual([]);
    });

    it('returns empty array when power productions is undefined', async () => {
      // Arrange
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = await PowerProductionProofOfOriginService.buildPowerSupplySubClassifications(
        undefined,
        givenHydrogenAmount,
      );

      // Assert
      expect(actualResult).toEqual([]);
    });
  });
});
