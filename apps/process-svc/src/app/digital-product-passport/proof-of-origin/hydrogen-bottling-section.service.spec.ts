/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProofOfOriginHydrogenBatchEntity } from '@h2-trust/amqp';
import { MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { HydrogenComponentEntityFixture, ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { BottlingService } from '../../process-step/bottling/bottling.service';
import { HydrogenBottlingSectionService } from './hydrogen-bottling-section.service';

describe('HydrogenBottlingSectionService', () => {
  let service: HydrogenBottlingSectionService;

  const bottlingServiceMock = {
    calculateHydrogenComposition: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HydrogenBottlingSectionService,
        {
          provide: BottlingService,
          useValue: bottlingServiceMock,
        },
      ],
    }).compile();

    service = module.get<HydrogenBottlingSectionService>(HydrogenBottlingSectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildSection', () => {
    it('returns section with hydrogen batch, composition and emissions', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenCompositions = [
        HydrogenComponentEntityFixture.createGreen({ amount: 60 }),
        HydrogenComponentEntityFixture.createYellow({ amount: 40 }),
      ];

      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenCompositions);

      // Act
      const actualResult = await service.buildSection(givenHydrogenBottling);

      // Assert
      expect(bottlingServiceMock.calculateHydrogenComposition).toHaveBeenCalledWith(givenHydrogenBottling);

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenBottling.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.amountCO2PerKgH2).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual(['E = [TBD]']);
      expect(batch.createdAt).toBe(givenHydrogenBottling.startedAt);
      expect(batch.amount).toBe(givenHydrogenBottling.batch.amount);
      expect(batch.unit).toBe(MeasurementUnit.HYDROGEN);
      expect(batch.batchType).toBe(givenHydrogenBottling.batch.type);
      expect(batch.hydrogenComposition).toEqual(givenHydrogenCompositions);
      expect(batch.unitId).toBe(givenHydrogenBottling.executedBy.id);
      expect(batch.color).toBe(givenHydrogenBottling.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenBottling.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenBottling.endedAt);
    });
  });
});
