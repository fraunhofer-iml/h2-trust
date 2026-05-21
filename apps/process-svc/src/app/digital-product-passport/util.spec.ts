/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfOriginHydrogenBatchEntityFixture,
  ProofOfOriginPowerBatchEntityFixture,
  ProofOfOriginWaterBatchEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BatchType } from '@h2-trust/domain';
import {
  assembleClassification,
  assembleSubClassification,
  calculateBatchEmission,
  sumAmounts,
} from './util';

describe('DigitalProductPassportUtils', () => {
  describe('assembleClassification', () => {
    it('should aggregate amount and emissions from batches and sub-classifications when called', () => {
      // arrange
      const givenPowerBatch = ProofOfOriginPowerBatchEntityFixture.create({
        amount: 10,
        emission: ProofOfOriginPowerBatchEntityFixture.create().emission,
      });
      const givenWaterBatch = ProofOfOriginWaterBatchEntityFixture.create({
        amount: 5,
      });
      const givenSubClassification = assembleSubClassification('Hydrogen source', BatchType.HYDROGEN, [
        ProofOfOriginHydrogenBatchEntityFixture.create({ amount: 3 }),
      ]);

      // act
      const actualResult = assembleClassification(
        'Power supply',
        BatchType.POWER,
        [givenPowerBatch, givenWaterBatch],
        [givenSubClassification],
      );

      // assert
      expect(actualResult.name).toBe('Power supply');
      expect(actualResult.classificationType).toBe(BatchType.POWER);
      expect(actualResult.amount).toBe(15);
      expect(actualResult.emissionOfProcessStep).toBeCloseTo(31.5);
      expect(actualResult.batches).toEqual([givenPowerBatch, givenWaterBatch]);
      expect(actualResult.subClassifications).toEqual([givenSubClassification]);
    });

    it('should fall back to sub-classification amount when no batches are present', () => {
      // arrange
      const givenSubClassification = assembleSubClassification('Hydrogen source', BatchType.HYDROGEN, [
        ProofOfOriginHydrogenBatchEntityFixture.create({ amount: 7 }),
      ]);

      // act
      const actualResult = assembleClassification('Hydrogen supply', BatchType.HYDROGEN, [], [givenSubClassification]);

      // assert
      expect(actualResult.amount).toBe(7);
      expect(actualResult.emissionOfProcessStep).toBeCloseTo(givenSubClassification.emissionOfProcessStep);
    });
  });

  describe('assembleSubClassification', () => {
    it('should build a sub-classification from the provided batches when called', () => {
      // arrange
      const givenBatches = [
        ProofOfOriginHydrogenBatchEntityFixture.create({ amount: 4 }),
        ProofOfOriginHydrogenBatchEntityFixture.create({ id: 'hydrogen-batch-2', amount: 6 }),
      ];

      // act
      const actualResult = assembleSubClassification('Hydrogen composition', BatchType.HYDROGEN, givenBatches);

      // assert
      expect(actualResult).toEqual(
        expect.objectContaining({
          name: 'Hydrogen composition',
          classificationType: BatchType.HYDROGEN,
          amount: 10,
          emissionOfProcessStep: 21,
          batches: givenBatches,
        }),
      );
    });
  });

  describe('sumAmounts', () => {
    it('should return the sum of all amounts when called', () => {
      expect(sumAmounts([{ amount: 2 }, { amount: 3 }, { amount: 5 }])).toBe(10);
    });
  });

  describe('calculateBatchEmission', () => {
    it('should sum emissions and treat missing emissions as zero when called', () => {
      // arrange
      const givenBatches = [
        ProofOfOriginPowerBatchEntityFixture.create(),
        {
          ...ProofOfOriginPowerBatchEntityFixture.create({ id: 'power-batch-2' }),
          emission: undefined,
        },
      ];

      // act
      const actualResult = calculateBatchEmission(givenBatches);

      // assert
      expect(actualResult).toBeCloseTo(10.5);
    });
  });
});