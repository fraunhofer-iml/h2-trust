/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProductionChainEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { assembleHydrogenTransportationSection } from './hydrogen-transportation-section.assembler';

describe('HydrogenTransportationProofOfOriginAssembler', () => {
  describe('assembleHydrogenTransportationSection', () => {
    it('should return a section with hydrogen batch, composition, and emissions when transport mode is trailer', () => {
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
        ProcessStepEntityFixture.createHydrogenTransportation(),
        [givenProductionChain],
        ProcessStepEntityFixture.createHydrogenBottling(),
      );

      // act
      const actualResult = assembleHydrogenTransportationSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const givenBatch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(givenBatch.id).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.id);
      expect(givenBatch.emission).toBeDefined();
      expect(givenBatch.createdAt).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().startedAt);
      expect(givenBatch.amount).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.amount);
      expect(givenBatch.unitId).toBe(ProcessStepEntityFixture.createHydrogenTransportation().executedBy.id);
      expect(givenBatch.processStep).toBe(ProcessStepEntityFixture.createHydrogenTransportation().type);
      expect(givenBatch.accountingPeriodEnd).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().endedAt);
    });

    it('should return a section with zero emissions when transport mode is pipeline', () => {
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
        ProcessStepEntityFixture.createHydrogenTransportation(),
        [givenProductionChain],
        ProcessStepEntityFixture.createHydrogenBottling(),
      );

      // act
      const actualResult = assembleHydrogenTransportationSection(givenProvenance)[0];

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);

      const givenBatch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(givenBatch.id).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.id);
      expect(givenBatch.emission).toBeDefined();
      expect(givenBatch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(givenBatch.emission.basisOfCalculation).toEqual([`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`]);
      expect(givenBatch.createdAt).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().startedAt);
      expect(givenBatch.amount).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.amount);
      expect(givenBatch.unitId).toBe(ProcessStepEntityFixture.createHydrogenTransportation().executedBy.id);
      expect(givenBatch.processStep).toBe(ProcessStepEntityFixture.createHydrogenTransportation().type);
      expect(givenBatch.accountingPeriodEnd).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().endedAt);
    });
  });
});
