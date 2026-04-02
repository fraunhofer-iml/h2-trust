/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType, RfnboType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { ProofOfOriginService } from '../proof-of-origin.service';

describe('ProofOfOriginService', () => {
  let service: ProofOfOriginService;
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

      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

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

      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

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

      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

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

      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      // Act
      const actualResult = service.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult.find((c) => c.rfnboType === RfnboType.RFNBO_READY).amount).toBe(60);
      expect(actualResult.find((c) => c.rfnboType === RfnboType.NON_CERTIFIABLE).amount).toBe(40);
    });

    it('throws error when process step is undefined', () => {
      // Arrange
      const givenProcessStep = undefined as unknown as ProcessStepEntity;

      const expectedErrorMessage = 'The provided process step is missing (undefined or null) or does not have a batch.';
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      // Act & Assert
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });

    it('throws error when process step type is invalid', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `The specified process step ${givenProcessStep.id} is neither ${ProcessType.HYDROGEN_BOTTLING}, ${ProcessType.HYDROGEN_TRANSPORTATION} nor ${ProcessType.HYDROGEN_PRODUCTION}, but of type ${ProcessType.POWER_PRODUCTION}`;
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      // Act & Assert
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });

    it('throws error when process step has no predecessors', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [],
        }),
      });
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      const expectedErrorMessage = `ProcessStep ${givenProcessStep.id} does not have predecessors.`;

      // Act & Assert
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });

    it('throws BrokerException when predecessor batch type is not HYDROGEN', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [BatchEntityFixture.createPowerBatch()],
        }),
      });
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      const expectedErrorMessage = `Predecessor batch ${givenProcessStep.batch.predecessors[0].id} should be type ${BatchType.HYDROGEN}, but is ${BatchType.POWER}.`;

      // Act & Assert
      expect(() => service.assembleCompositionForBottling(givenProvenance)).toThrow(expectedErrorMessage);
    });

    it(`reads predecessor for ${ProcessType.HYDROGEN_TRANSPORTATION} process step`, async () => {
      // Arrange
      const givenBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
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

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenBottlingProcessStep.id,
            }),
          ],
        }),
      });
      const givenProvenance = new ProvenanceEntity(givenTransportationProcessStep, [], givenBottlingProcessStep);

      // Act
      const actualResult = await service.assembleCompositionForBottling(givenProvenance);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });

    it('throws error when transportation has no predecessor', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [],
        }),
      });
      const givenProvenance = new ProvenanceEntity(givenProcessStep, [], givenProcessStep);

      const expectedErrorMessage = `Process step ${givenProcessStep.id} has no predecessor to derive composition from`;

      // Act & Assert
      await expect(service.assembleCompositionForBottling(givenProvenance)).rejects.toThrow(expectedErrorMessage);
    });

    it(`throws error when predecessor is not ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
      // Arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenPredecessorProcessStep.id,
            }),
          ],
        }),
      });
      const givenProvenance = new ProvenanceEntity(givenTransportationProcessStep, [], undefined);

      const expectedErrorMessage = `Predecessor process step ${givenPredecessorProcessStep.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`;

      // Act & Assert
      await expect(service.assembleCompositionForBottling(givenProvenance)).rejects.toThrow(expectedErrorMessage);
    });
  });
});
