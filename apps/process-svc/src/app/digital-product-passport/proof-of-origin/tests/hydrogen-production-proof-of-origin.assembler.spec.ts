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
import { assembleHydrogenProductionSection } from '../hydrogen-production-proof-of-origin.assembler';

describe('HydrogenProductionProofOfOriginAssembler', () => {
  describe('assembleHydrogenProductionSection', () => {
    it('returns section with power supply and water supply classifications', () => {
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

      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
      expect(actualResult.classifications[0].emissionOfProcessStep).toEqual(
        givenPowerSubClassifications[0].emissionOfProcessStep,
      );
    });

    it('returns section with only power supply classification when no water consumptions', () => {
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

      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
    });

    it('returns section with only water supply classification when no power productions', () => {
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

      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(2);
    });

    it('returns section with empty classifications when no power productions and no water consumptions', () => {
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

      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.batches).toEqual([]);
    });
  });
});
