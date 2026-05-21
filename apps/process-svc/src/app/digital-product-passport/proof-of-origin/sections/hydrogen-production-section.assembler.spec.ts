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
  ProofOfOriginBatchEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import {
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  ProofOfOriginPowerBatchEntityFixture,
  ProofOfOriginSubClassificationEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { EnergySource, ProofOfOrigin } from '@h2-trust/domain';
import { assembleHydrogenProductionSection } from './hydrogen-production-section.assembler';

describe('HydrogenProductionProofOfOriginAssembler', () => {
  describe('assembleHydrogenProductionSection', () => {
    it('should return a section with power and water supply classifications when both inputs are present', () => {
    // arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

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

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProduction,
        [ProductionChainEntityFixture.create()],
        givenHydrogenProduction,
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
      expect(actualResult.classifications[0].emissionOfProcessStep).toEqual(
        givenPowerSubClassifications[0].emissionOfProcessStep,
      );
    });

    it('should return a section with only power supply classification when no water consumptions are present', () => {
    // arrange
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        productionChain.hydrogenRootProduction,
        [productionChain],
        productionChain.hydrogenRootProduction,
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
    });

    it('should return a section with only water supply classification when no power productions are present', () => {
    // arrange
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        productionChain.hydrogenRootProduction,
        [productionChain],
        productionChain.hydrogenRootProduction,
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
    });

    it('should return a section with empty classifications when no power productions and no water consumptions are present', () => {
    // arrange
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        productionChain.hydrogenRootProduction,
        [productionChain],
        productionChain.hydrogenRootProduction,
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.batches).toEqual([]);
    });
  });
});
