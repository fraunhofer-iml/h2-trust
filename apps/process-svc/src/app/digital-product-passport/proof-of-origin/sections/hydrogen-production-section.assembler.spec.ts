/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProductionChainEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginSectionEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import {
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  ProofOfOriginPowerBatchEntityFixture,
  ProofOfOriginSubClassificationEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BatchType, PowerProductionType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleHydrogenProductionSection } from './hydrogen-production-section.assembler';

describe('HydrogenProductionProofOfOriginAssembler', () => {
  describe('assembleHydrogenProductionSection', () => {
    it('should return a section with power and water supply classifications when both inputs are present', () => {
      // arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const givenProductionPowerBatches: ProofOfOriginBatchEntity = ProofOfOriginPowerBatchEntityFixture.create({
        accountingPeriodEnd: ProcessStepEntityFixture.createPowerProduction().endedAt,
        amount: ProcessStepEntityFixture.createPowerProduction().batch.amount,
      });

      const givenPowerSubClassifications = [
        ProofOfOriginSubClassificationEntityFixture.create({
          name: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
          emissionOfProcessStep: 0,
          batches: [givenProductionPowerBatches],
        }),
      ];

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProduction,
        [givenHydrogenProduction],
        [ProductionChainEntityFixture.create()],
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(3);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
      expect(actualResult.classifications[0].emissionOfProcessStep).toEqual(
        givenPowerSubClassifications[0].emissionOfProcessStep,
      );
    });

    it('should return a section with only power supply and h2 production classification when no water consumptions are present', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy,
        ProcessStepEntityFixture.createWaterConsumption().executedBy,
      );

      const givenProvenance = new ProvenanceEntity(
        givenProductionChain.hydrogenRootProduction,
        [givenProductionChain.hydrogenRootProduction],
        [givenProductionChain],
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(3);
      expect(actualResult.classifications[0].name).toBe(ProofOfOrigin.POWER_SUPPLY_CLASSIFICATION);
    });

    it('should return a section with only water supply and h2 production classification when no power productions are present', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy,
        ProcessStepEntityFixture.createWaterConsumption().executedBy,
      );

      const givenProvenance = new ProvenanceEntity(
        givenProductionChain.hydrogenRootProduction,
        [givenProductionChain.hydrogenRootProduction],
        [givenProductionChain],
      );

      // act
      const actualResult = assembleHydrogenProductionSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION);
      expect(actualResult.classifications).toHaveLength(3);
    });

    it('should return a section with one classification for h2 production when no power productions and no water consumptions are present', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        undefined,
        undefined,
        ProcessStepEntityFixture.createPowerProduction().executedBy,
        ProcessStepEntityFixture.createWaterConsumption().executedBy,
      );

      const givenProvenance = new ProvenanceEntity(
        givenProductionChain.hydrogenRootProduction,
        [givenProductionChain.hydrogenRootProduction],
        [givenProductionChain],
      );

      // act
      const actualResult: ProofOfOriginSectionEntity[] = assembleHydrogenProductionSection(givenProvenance);

      // assert
      expect(actualResult[0].classifications[0].amount).toEqual(1);
      expect(actualResult[0].classifications[0].classificationType).toEqual(BatchType.H2_PRODUCTION);
      expect(actualResult[0].classifications[0].emissionOfProcessStep).toEqual(8.6);
      expect(actualResult[0].classifications[0].name).toEqual('H2 Production');
    });
  });
});
