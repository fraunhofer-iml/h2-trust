/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceEntity, RedComplianceEntity } from '@h2-trust/amqp';
import { BiddingZone } from '@h2-trust/domain';
import {
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/fixtures/entities';
import { ProvenanceService } from '../../provenance/provenance.service';
import { MatchedProductionPair } from './matched-production-pair';
import { RedCompliancePairingService } from './red-compliance-pairing.service';
import { RedComplianceService } from './red-compliance.service';

describe('RedComplianceService', () => {
  let service: RedComplianceService;

  const redCompliancePairingServiceMock = {
    buildMatchedPairs: jest.fn(),
  };

  const provenanceServiceMock = {
    buildProvenance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedComplianceService,
        {
          provide: RedCompliancePairingService,
          useValue: redCompliancePairingServiceMock,
        },
        {
          provide: ProvenanceService,
          useValue: provenanceServiceMock,
        },
      ],
    }).compile();

    service = module.get<RedComplianceService>(RedComplianceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('determineRedCompliance', () => {
    it('throws RpcException when provenance is null', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';

      provenanceServiceMock.buildProvenance.mockResolvedValue(null);

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenProcessStepId)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws RpcException when powerProductions is empty', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenProvenance = new ProvenanceEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        undefined,
        [ProcessStepEntityFixture.createHydrogenProduction()],
        [],
        [],
      );

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenProcessStepId)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws RpcException when hydrogenProductions is empty', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenProvenance = new ProvenanceEntity(
        ProcessStepEntityFixture.createPowerProduction(),
        undefined,
        [],
        [],
        [ProcessStepEntityFixture.createPowerProduction()],
      );

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenProcessStepId)).rejects.toThrow(expectedErrorMessage);
    });

    it('returns RedComplianceEntity with all flags true when all compliance criteria are met', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
      });

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      // Act
      const actualResult = await service.determineRedCompliance(givenProcessStepId);

      // Assert
      expect(actualResult).toBeInstanceOf(RedComplianceEntity);
      expect(actualResult.isGeoCorrelationValid).toBe(true);
      expect(actualResult.isTimeCorrelationValid).toBe(true);
      expect(actualResult.isAdditionalityFulfilled).toBe(true);
      expect(actualResult.financialSupportReceived).toBe(true);

      expect(provenanceServiceMock.buildProvenance).toHaveBeenCalledWith(givenProcessStepId);
      expect(redCompliancePairingServiceMock.buildMatchedPairs).toHaveBeenCalledWith(
        givenProvenance.powerProductions,
        givenProvenance.hydrogenProductions,
        givenProcessStepId,
      );
    });

    it('returns RedComplianceEntity with isGeoCorrelationValid false when units are in different bidding zones', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
      });

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.BE,
        commissionedOn: new Date('2025-01-01'),
      });

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      // Act
      const actualResult = await service.determineRedCompliance(givenProcessStepId);

      // Assert
      expect(actualResult.isGeoCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isTimeCorrelationValid false when productions are not within time correlation', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T03:00:00Z'),
      });

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      // Act
      const actualResult = await service.determineRedCompliance(givenProcessStepId);

      // Assert
      expect(actualResult.isTimeCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isAdditionalityFulfilled false when additionality criterion is not met', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
      });

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2020-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      // Act
      const actualResult = await service.determineRedCompliance(givenProcessStepId);

      // Assert
      expect(actualResult.isAdditionalityFulfilled).toBe(false);
    });

    it('returns RedComplianceEntity with financialSupportReceived false when financial support was received', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
      });

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: true,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      // Act
      const actualResult = await service.determineRedCompliance(givenProcessStepId);

      // Assert
      expect(actualResult.financialSupportReceived).toBe(false);
    });

    it('throws HttpException when power production unit is missing', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create();

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: undefined },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: givenHydrogenUnit },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      const expectedErrorMessage = `Production units not found: powerUnitId [${givenPowerProcessStep.executedBy.id}] or hydrogenUnitId [${givenHydrogenProcessStep.executedBy.id}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenProcessStepId)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws HttpException when hydrogen production unit is missing', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenProcessStep,
        undefined,
        [givenHydrogenProcessStep],
        [],
        [givenPowerProcessStep],
      );

      const givenPowerUnit = PowerProductionUnitEntityFixture.create();

      const givenMatchedPairs: MatchedProductionPair[] = [
        {
          power: { processStep: givenPowerProcessStep, unit: givenPowerUnit },
          hydrogen: { processStep: givenHydrogenProcessStep, unit: undefined },
        },
      ];

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      redCompliancePairingServiceMock.buildMatchedPairs.mockResolvedValue(givenMatchedPairs);

      const expectedErrorMessage = `Production units not found: powerUnitId [${givenPowerProcessStep.executedBy.id}] or hydrogenUnitId [${givenHydrogenProcessStep.executedBy.id}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenProcessStepId)).rejects.toThrow(expectedErrorMessage);
    });
  });
});
