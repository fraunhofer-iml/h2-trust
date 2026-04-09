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
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures';
import { assembleHydrogenStorageSection } from '../hydrogen-storage-proof-of-origin.assembler';

describe('HydrogenStorageProofOfOriginAssembler', () => {
  describe('assembleHydrogenStorageSection', () => {
    it('returns section with classifications grouped by hydrogen rfnbo type', () => {
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
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

      const actualResult = assembleHydrogenStorageSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(1);

      const rfnboReadyClassification = actualResult.classifications.find((c) => c.name === RfnboType.RFNBO_READY);
      expect(rfnboReadyClassification).toBeDefined();
      expect(rfnboReadyClassification.classificationType).toBe(BatchType.HYDROGEN);
      expect(rfnboReadyClassification.batches).toHaveLength(1);

      const rfnboReadyBatch = rfnboReadyClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(rfnboReadyBatch.emission).toBeDefined();
      expect(rfnboReadyBatch.rfnboType).toBe(RfnboType.RFNBO_READY);
    });

    it('returns empty section when no hydrogen productions provided', async () => {
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

      const actualResult = assembleHydrogenStorageSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
    });

    it('returns empty section when hydrogen productions is undefined', async () => {
      const actualResult = assembleHydrogenStorageSection(undefined);

      expect(actualResult).toEqual([]);
    });
  });
});
