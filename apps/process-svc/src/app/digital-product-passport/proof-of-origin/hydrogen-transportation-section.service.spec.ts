/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginHydrogenBatchEntity } from '@h2-trust/amqp';
import { MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import {
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  TransportationDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { HydrogenTransportationSectionService } from './hydrogen-transportation-section.service';

describe('HydrogenTransportationSectionService', () => {
  const bottlingServiceMock = {
    calculateHydrogenComposition: jest.fn(),
  };

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
      const givenHydrogenCompositions = [
        HydrogenComponentEntityFixture.createGreen({ amount: 60 }),
        HydrogenComponentEntityFixture.createYellow({ amount: 40 }),
      ];

      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenCompositions);

      // Act
      const actualResult = await HydrogenTransportationSectionService.buildSection(
        givenHydrogenTransportation,
        givenHydrogenCompositions,
      );

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenTransportation.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBeGreaterThan(0);
      expect(batch.createdAt).toBe(givenHydrogenTransportation.startedAt);
      expect(batch.amount).toBe(givenHydrogenTransportation.batch.amount);
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
      const givenHydrogenCompositions = [HydrogenComponentEntityFixture.createGreen()];

      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenCompositions);

      // Act
      const actualResult = await HydrogenTransportationSectionService.buildSection(
        givenHydrogenTransportation,
        givenHydrogenCompositions,
      );

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION);
      expect(actualResult.batches).toHaveLength(1);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenTransportation.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual([`E = 0 ${MeasurementUnit.G_CO2_PER_KG_H2}`]);
      expect(batch.createdAt).toBe(givenHydrogenTransportation.startedAt);
      expect(batch.amount).toBe(givenHydrogenTransportation.batch.amount);
      expect(batch.hydrogenComposition).toEqual(givenHydrogenCompositions);
      expect(batch.unitId).toBe(givenHydrogenTransportation.executedBy.id);
      expect(batch.color).toBe(givenHydrogenTransportation.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenTransportation.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenTransportation.endedAt);
    });
  });
});
