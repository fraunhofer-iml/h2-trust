/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginBatchEntity } from '@h2-trust/amqp';
import { EnergySource, ProofOfOrigin } from '@h2-trust/domain';
import {
  ProcessStepEntityFixture,
  ProofOfOriginPowerBatchEntityFixture,
  ProofOfOriginSubClassificationEntityFixture,
} from '@h2-trust/fixtures/entities';
import { HydrogenProductionProofOfOriginService } from '../hydrogen-production-proof-of-origin.service';

describe('HydrogenProductionProofOfOriginService', () => {
  describe('buildHydrogenProductionSection', () => {
    it('returns section with power supply and water supply classifications', () => {
      // Arrange
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenHydrogenAmount = 100;

      const productionPowerBatches: ProofOfOriginBatchEntity = ProofOfOriginPowerBatchEntityFixture.create({
        accountingPeriodEnd: ProcessStepEntityFixture.createPowerProduction().endedAt,
        amount: ProcessStepEntityFixture.createPowerProduction().batch.amount,
      });

      const givenPowerSubClassifications = [
        ProofOfOriginSubClassificationEntityFixture.create({
          name: EnergySource.SOLAR_ENERGY,
          emissionOfProcessStep: 0,
          batches: [productionPowerBatches],
        }),
      ];

      // Act
      const actualResult = HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
        givenPowerProductions,
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      // Assert

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      //expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
      //expect(actualResult.classifications[0].name).toEqual(givenPowerSubClassifications[0].name);
      expect(actualResult.classifications[0].emissionOfProcessStep).toEqual(
        givenPowerSubClassifications[0].emissionOfProcessStep,
      );
      //expect(actualResult.classifications[1]).toEqual(givenWaterSupplyClassification);
    });

    it('returns section with only power supply classification when no water consumptions', () => {
      // Arrange
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];
      const givenWaterConsumptions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
        givenPowerProductions,
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      // Assert

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(1);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
    });

    it('returns section with only water supply classification when no power productions', () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenHydrogenAmount = 100;

      /*const givenWaterSupplyClassification = ProofOfOriginClassificationEntityFixture.create({
        name: ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION,
      });*/

      // Act
      const actualResult = HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
        givenPowerProductions,
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      // Assert

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(1);
      //expect(actualResult.classifications[0]).toEqual(givenWaterSupplyClassification);
    });

    it('returns section with empty classifications when no power productions and no water consumptions', () => {
      // Arrange
      const givenPowerProductions: ProcessStepEntity[] = [];
      const givenWaterConsumptions: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = HydrogenProductionProofOfOriginService.buildHydrogenProductionSection(
        givenPowerProductions,
        givenWaterConsumptions,
        givenHydrogenAmount,
      );

      // Assert

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });
  });
});
