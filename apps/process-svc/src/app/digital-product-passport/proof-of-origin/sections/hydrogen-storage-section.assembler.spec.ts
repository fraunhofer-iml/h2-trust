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
  ProofOfOriginHydrogenBatchEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { BatchType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { assembleHydrogenStorageSection } from './hydrogen-storage-section.assembler';

describe('HydrogenStorageProofOfOriginAssembler', () => {
  describe('assembleHydrogenStorageSection', () => {
    it('should return a section when classifications are grouped by hydrogen RFNBO type', () => {
    // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        givenProductionChain.hydrogenRootProduction,
        [givenProductionChain],
        givenProductionChain.hydrogenRootProduction,
      );

      // act
      const actualResult = assembleHydrogenStorageSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(1);

      const givenRfnboReadyClassification = actualResult.classifications.find((c) => c.name === RfnboType.RFNBO_READY);
      expect(givenRfnboReadyClassification).toBeDefined();
      expect(givenRfnboReadyClassification.classificationType).toBe(BatchType.HYDROGEN);
      expect(givenRfnboReadyClassification.batches).toHaveLength(1);

      const givenRfnboReadyBatch = givenRfnboReadyClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(givenRfnboReadyBatch.emission).toBeDefined();
      expect(givenRfnboReadyBatch.rfnboType).toBe(RfnboType.RFNBO_READY);
    });

    it('should return an empty section when no hydrogen productions are provided', async () => {
    // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        givenProductionChain.hydrogenRootProduction,
        [givenProductionChain],
        givenProductionChain.hydrogenRootProduction,
      );

      // act
      const actualResult = assembleHydrogenStorageSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
    });
  });
});
