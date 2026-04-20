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
} from '@h2-trust/contracts';
import { MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/testing';
import { assembleHydrogenTransportationSection } from '../hydrogen-transportation-proof-of-origin.assembler';

describe('HydrogenTransportationProofOfOriginAssembler', () => {
  describe('assembleHydrogenTransportationSection', () => {
    it('returns section with hydrogen batch, composition and emissions for trailer transport', () => {
      // Arrange
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        ProcessStepEntityFixture.createHydrogenTransportation(),
        [productionChain],
        ProcessStepEntityFixture.createHydrogenBottling(),
      );

      // Act
      const actualResult = assembleHydrogenTransportationSection(givenProvenance)[0];

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.createdAt).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().startedAt);
      expect(batch.amount).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.amount);
      expect(batch.unitId).toBe(ProcessStepEntityFixture.createHydrogenTransportation().executedBy.id);
      expect(batch.color).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.qualityDetails.color);
      expect(batch.processStep).toBe(ProcessStepEntityFixture.createHydrogenTransportation().type);
      expect(batch.accountingPeriodEnd).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().endedAt);
    });

    it('returns section with zero emissions for pipeline transport', () => {
      // Arrange
      const productionChain: ProductionChainEntity = new ProductionChainEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
        ProcessStepEntityFixture.createWaterConsumption(),
        ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
        ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
      );

      const givenProvenance = new ProvenanceEntity(
        ProcessStepEntityFixture.createHydrogenTransportation(),
        [productionChain],
        ProcessStepEntityFixture.createHydrogenBottling(),
      );

      // Act
      const actualResult = assembleHydrogenTransportationSection(givenProvenance)[0];

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual([`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`]);
      expect(batch.createdAt).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().startedAt);
      expect(batch.amount).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.amount);
      expect(batch.unitId).toBe(ProcessStepEntityFixture.createHydrogenTransportation().executedBy.id);
      expect(batch.color).toBe(ProcessStepEntityFixture.createHydrogenTransportation().batch.qualityDetails.color);
      expect(batch.processStep).toBe(ProcessStepEntityFixture.createHydrogenTransportation().type);
      expect(batch.accountingPeriodEnd).toEqual(ProcessStepEntityFixture.createHydrogenTransportation().endedAt);
    });
  });
});
