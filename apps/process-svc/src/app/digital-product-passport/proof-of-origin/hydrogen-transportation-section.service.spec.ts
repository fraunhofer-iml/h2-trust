/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProofOfOriginHydrogenBatchEntity } from '@h2-trust/amqp';
import { MeasurementUnit, ProofOfOrigin, UNIT_G_CO2_PER_KG_H2 } from '@h2-trust/domain';
import {
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  TransportationDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { BottlingService } from '../../process-step/bottling/bottling.service';
import { HydrogenTransportationSectionService } from './hydrogen-transportation-section.service';

describe('HydrogenTransportationSectionService', () => {
  let service: HydrogenTransportationSectionService;

  const bottlingServiceMock = {
    calculateHydrogenComposition: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HydrogenTransportationSectionService,
        {
          provide: BottlingService,
          useValue: bottlingServiceMock,
        },
      ],
    }).compile();

    service = module.get<HydrogenTransportationSectionService>(HydrogenTransportationSectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildSection', () => {
    it('returns section with hydrogen batch, composition and emissions for trailer transport', async () => {
      // Arrange
      const givenTransportationDetails = TransportationDetailsEntityFixture.createTrailer();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails: givenTransportationDetails,
      });
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenCompositions = [
        HydrogenComponentEntityFixture.createGreen({ amount: 60 }),
        HydrogenComponentEntityFixture.createYellow({ amount: 40 }),
      ];

      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenCompositions);

      // Act
      const actualResult = await service.buildSection(givenHydrogenTransportation, givenHydrogenBottling);

      // Assert
      expect(bottlingServiceMock.calculateHydrogenComposition).toHaveBeenCalledWith(givenHydrogenBottling);

      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenTransportation.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBeGreaterThan(0);
      expect(batch.createdAt).toBe(givenHydrogenTransportation.startedAt);
      expect(batch.amount).toBe(givenHydrogenTransportation.batch.amount);
      expect(batch.unit).toBe(MeasurementUnit.HYDROGEN);
      expect(batch.hydrogenComposition).toEqual(givenHydrogenCompositions);
      expect(batch.unitId).toBe(givenHydrogenTransportation.executedBy.id);
      expect(batch.color).toBe(givenHydrogenTransportation.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenTransportation.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenTransportation.endedAt);
    });

    it('returns section with zero emissions for pipeline transport', async () => {
      // Arrange
      const givenTransportationDetails = TransportationDetailsEntityFixture.createPipeline();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
        transportationDetails: givenTransportationDetails,
      });
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenCompositions = [HydrogenComponentEntityFixture.createGreen()];

      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenCompositions);

      // Act
      const actualResult = await service.buildSection(givenHydrogenTransportation, givenHydrogenBottling);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenTransportation.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual([`E = 0 ${UNIT_G_CO2_PER_KG_H2}`]);
      expect(batch.createdAt).toBe(givenHydrogenTransportation.startedAt);
      expect(batch.amount).toBe(givenHydrogenTransportation.batch.amount);
      expect(batch.unit).toBe(MeasurementUnit.HYDROGEN);
      expect(batch.hydrogenComposition).toEqual(givenHydrogenCompositions);
      expect(batch.unitId).toBe(givenHydrogenTransportation.executedBy.id);
      expect(batch.color).toBe(givenHydrogenTransportation.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenTransportation.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenTransportation.endedAt);
    });
  });
});
