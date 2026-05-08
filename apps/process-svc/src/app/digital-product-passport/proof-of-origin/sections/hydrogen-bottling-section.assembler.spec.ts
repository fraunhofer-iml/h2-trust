/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProductionChainEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleHydrogenBottlingSection } from './hydrogen-bottling-section.assembler';

describe('HydrogenBottlingProofOfOriginAssembler', () => {
  describe('assembleHydrogenBottlingSection', () => {
    it('returns section with hydrogen batch, composition and emissions', async () => {
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [ProductionChainEntityFixture.create()],
        givenHydrogenBottling,
      );

      const actualResult: ProofOfOriginSectionEntity = assembleHydrogenBottlingSection(givenProvenance)[0];

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenBottling.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual(['E = [TBD]']);
      expect(batch.createdAt).toBe(givenHydrogenBottling.startedAt);
      expect(batch.amount).toBe(givenHydrogenBottling.batch.amount);
      expect(batch.batchType).toBe(givenHydrogenBottling.batch.type);
      expect(batch.unitId).toBe(givenHydrogenBottling.executedBy.id);
      expect(batch.processStep).toBe(givenHydrogenBottling.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenBottling.endedAt);
    });
  });

  describe('calculateHydrogenComposition', () => {
    it(`returns composition for ${ProcessType.HYDROGEN_BOTTLING} process step`, () => {
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.create(),
            }),
          ],
        }),
      });
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      const actualResult = assembleHydrogenBottlingSection(givenProvenance);

      expect(actualResult).toHaveLength(1);
    });

    it('assembles amount from one predecessor', () => {
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.create(),
            }),
          ],
        }),
      });

      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      const actualResult = assembleHydrogenBottlingSection(givenProvenance);
      const hydrogenComponentsResult = actualResult[0].batches[0] as ProofOfOriginHydrogenBatchEntity;

      expect(actualResult).toHaveLength(1);
      expect(hydrogenComponentsResult.amount).toBe(100);
    });

    it('assembles amount from two predecessors', () => {
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 50,
              qualityDetails: QualityDetailsEntityFixture.create(),
            }),
            BatchEntityFixture.createHydrogenBatch({
              amount: 50,
              qualityDetails: QualityDetailsEntityFixture.create(),
            }),
          ],
        }),
      });

      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      const actualResult = assembleHydrogenBottlingSection(givenProvenance);
      const hydrogenComponentsResult = actualResult[0].batches[0] as ProofOfOriginHydrogenBatchEntity;

      expect(actualResult).toHaveLength(1);
      expect(hydrogenComponentsResult.amount).toBe(100);
    });

    it('returns [] when process step is undefined', () => {
      const givenProcessStep = undefined as unknown as ProcessStepEntity;
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      const actualResult = assembleHydrogenBottlingSection(givenProvenance);

      expect(actualResult).toEqual([]);
    });

    it('throws error when process step type is invalid', () => {
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const expectedErrorMessage = `There are no hydrogen productions in provenance.`;
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      expect(() => assembleHydrogenBottlingSection(givenProvenance)).toThrow(expectedErrorMessage);
    });
  });
});
