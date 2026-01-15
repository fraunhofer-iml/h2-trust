/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { HydrogenComponentAssembler } from './hydrogen-component.assembler';

describe('HydrogenComponentAssembler', () => {
  describe('assemble', () => {
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

      // Act
      const actualResult = HydrogenComponentAssembler.assemble(givenProcessStep);

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

      // Act
      const actualResult = HydrogenComponentAssembler.assemble(givenProcessStep);

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

      // Act
      const actualResult = HydrogenComponentAssembler.assemble(givenProcessStep);

      // Assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult.find((c) => c.color === HydrogenColor.GREEN).amount).toBe(60);
      expect(actualResult.find((c) => c.color === HydrogenColor.YELLOW).amount).toBe(40);
    });

    it('throws error when process step is undefined', () => {
      // Arrange
      const givenProcessStep = undefined as unknown as ProcessStepEntity;

      const expectedErrorMessage = 'The provided bottling process step is missing (undefined or null).';

      // Act & Assert
      expect(() => HydrogenComponentAssembler.assemble(givenProcessStep)).toThrow(expectedErrorMessage);
    });

    it('throws error when process step type is invalid', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `ProcessStep ${givenProcessStep.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${ProcessType.HYDROGEN_PRODUCTION}.`;

      // Act & Assert
      expect(() => HydrogenComponentAssembler.assemble(givenProcessStep)).toThrow(expectedErrorMessage);
    });

    it('throws error when process step has no predecessors', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [],
        }),
      });

      const expectedErrorMessage = `ProcessStep ${givenProcessStep.id} does not have predecessors.`;

      // Act & Assert
      expect(() => HydrogenComponentAssembler.assemble(givenProcessStep)).toThrow(expectedErrorMessage);
    });

    it('throws BrokerException when predecessor batch type is not HYDROGEN', () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [BatchEntityFixture.createPowerBatch()],
        }),
      });

      const expectedErrorMessage = `Predecessor batch ${givenProcessStep.batch.predecessors[0].id} should be type ${BatchType.HYDROGEN}, but is ${BatchType.POWER}.`;

      // Act & Assert
      expect(() => HydrogenComponentAssembler.assemble(givenProcessStep)).toThrow(expectedErrorMessage);
    });
  });
});
