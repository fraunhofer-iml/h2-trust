/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionChainEntity, ProvenanceEntity } from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { assembleHydrogenStorageSections } from './hydrogen-storage-section.assembler';

describe('HydrogenStorageProofOfOriginAssembler', () => {
  describe('assembleHydrogenStorageSection', () => {
    it('should return an empty section when no hydrogen productions are provided', async () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenBottling(),
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
      const actualResult = assembleHydrogenStorageSections(givenProvenance);

      // assert
      expect(actualResult).toEqual([]);
    });
  });
});
