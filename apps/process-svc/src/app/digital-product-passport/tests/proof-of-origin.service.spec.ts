/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity, ProductionChainEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { HydrogenColor, ProcessType, RfnboType } from '@h2-trust/domain';
import {
  BatchEntityFixture,
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { ProofOfOriginService } from '../proof-of-origin/proof-of-origin.service';

describe('ProofOfOriginService', () => {
  let service: ProofOfOriginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProofOfOriginService],
    }).compile();

    service = module.get<ProofOfOriginService>(ProofOfOriginService);
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
      const actualResult = service.assembleCompositionForBottling(givenProvenance);

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
      const actualResult = service.assembleCompositionForBottling(givenProvenance);

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
      const actualResult = service.assembleCompositionForBottling(givenProvenance);

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
      const actualResult = service.assembleCompositionForBottling(givenProvenance);

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
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });

    it('throws error when process step type is invalid', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `There are no hydrogen productions in Provenance.`;
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      // Act & Assert
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });
  });
});
