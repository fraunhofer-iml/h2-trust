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
} from '@h2-trust/amqp';
import { HydrogenColor, ProcessType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import {
  BatchEntityFixture,
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/fixtures';
import { HydrogenBottlingProofOfOriginService } from '../hydrogen-bottling-proof-of-origin.service';

describe('HydrogenBottlingSectionAssembler', () => {
  const hydrogenBottlingProofOfOriginService: HydrogenBottlingProofOfOriginService =
    new HydrogenBottlingProofOfOriginService();
  describe('assembleHydrogenBottlingSection', () => {
    it('returns section with hydrogen batch, composition and emissions', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [ProductionChainEntityFixture.create()],
        givenHydrogenBottling,
      );

      // Act
      const actualResult: ProofOfOriginSectionEntity =
        hydrogenBottlingProofOfOriginService.assembleSection(givenProvenance)[0];

      // Assert
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
      expect(batch.color).toBe(givenHydrogenBottling.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenBottling.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenBottling.endedAt);
    });
  });

  describe('calculateHydrogenComposition', () => {
    it(`returns composition for ${ProcessType.HYDROGEN_BOTTLING} process step`, () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      // Act
      const actualResult = hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });
    it('assembles amount from one predecessor', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });

      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      // Act
      const actualResult = hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
      expect(actualResult[0].amount).toBe(100);
    });

    it('assembles amount from two predecessors with same color', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 50,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
            BatchEntityFixture.createHydrogenBatch({
              amount: 50,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });

      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      // Act
      const actualResult = hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
      expect(actualResult[0].amount).toBe(100);
    });

    it('assembles amount from two predecessors with different colors', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 60,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
            BatchEntityFixture.createHydrogenBatch({
              amount: 40,
              qualityDetails: QualityDetailsEntityFixture.createYellow(),
            }),
          ],
        }),
      });

      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.hydrogenLeafProduction = givenProcessStep;
      givenProductionChain.hydrogenRootProduction = givenProcessStep;
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      // Act
      const actualResult = hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult.find((c) => c.rfnboType === RfnboType.RFNBO_READY).amount).toBe(100);
    });

    it('throws error when process step is undefined', () => {
      // Arrange
      const givenProcessStep = undefined as unknown as ProcessStepEntity;

      const expectedErrorMessage = 'There is no hydrogen bottling in provenance.';
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [givenProductionChain], givenProcessStep);

      // Act & Assert
      expect(() => hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance)).toThrow(
        expectedErrorMessage,
      );
    });

    it('throws error when process step type is invalid', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `There are no hydrogen productions in Provenance.`;
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      // Act & Assert
      expect(() => hydrogenBottlingProofOfOriginService.assembleCompositionForBottling(givenProvenance)).toThrow(
        expectedErrorMessage,
      );
    });
  });
});
