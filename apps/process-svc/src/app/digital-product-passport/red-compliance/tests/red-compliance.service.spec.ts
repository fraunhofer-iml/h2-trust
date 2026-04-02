/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RedComplianceEntity } from '@h2-trust/amqp';
import { BiddingZone } from '@h2-trust/domain';
import {
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/fixtures/entities';
import { RedComplianceService } from '../red-compliance.service';

describe('RedComplianceService', () => {
  let service: RedComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedComplianceService],
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

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(undefined, undefined)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws RpcException when powerProductions is empty', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const powerProduction = ProcessStepEntityFixture.createPowerProduction();
      const hydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(hydrogenProduction, powerProduction)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('throws RpcException when hydrogenProductions is empty', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const powerProduction = ProcessStepEntityFixture.createPowerProduction();
      const hydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `Provenance or required productions (power/hydrogen) are missing for processStepId [${givenProcessStepId}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(hydrogenProduction, powerProduction)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('returns RedComplianceEntity with all flags true when all compliance criteria are met', async () => {
      // Arrange
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
        executedBy: givenPowerUnit,
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
        executedBy: givenHydrogenUnit,
      });

      // Act
      const actualResult = await service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult).toBeInstanceOf(RedComplianceEntity);
      expect(actualResult.isGeoCorrelationValid).toBe(true);
      expect(actualResult.isTimeCorrelationValid).toBe(true);
      expect(actualResult.isAdditionalityFulfilled).toBe(true);
      expect(actualResult.financialSupportReceived).toBe(true);
    });

    it('returns RedComplianceEntity with isGeoCorrelationValid false when units are in different bidding zones', async () => {
      // Arrange
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.BE,
        commissionedOn: new Date('2025-01-01'),
      });
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
        executedBy: givenPowerUnit,
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
        executedBy: givenHydrogenUnit,
      });

      // Act
      const actualResult = await service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isGeoCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isTimeCorrelationValid false when productions are not within time correlation', async () => {
      // Arrange
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
        executedBy: givenPowerUnit,
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T03:00:00Z'),
        executedBy: givenHydrogenUnit,
      });

      // Act
      const actualResult = await service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isTimeCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isAdditionalityFulfilled false when additionality criterion is not met', async () => {
      // Arrange
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2020-01-01'),
        financialSupportReceived: false,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
        executedBy: givenPowerUnit,
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
        executedBy: givenHydrogenUnit,
      });

      // Act
      const actualResult = await service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isAdditionalityFulfilled).toBe(false);
    });

    it('returns RedComplianceEntity with financialSupportReceived false when financial support was received', async () => {
      // Arrange
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
        financialSupportReceived: true,
      });

      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        biddingZone: BiddingZone.DE_LU,
        commissionedOn: new Date('2025-01-01'),
      });
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction({
        startedAt: new Date('2026-01-01T01:00:00Z'),
        executedBy: givenPowerUnit,
      });
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        startedAt: new Date('2026-01-01T01:30:00Z'),
        executedBy: givenHydrogenUnit,
      });

      // Act
      const actualResult = await service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.financialSupportReceived).toBe(false);
    });

    it('throws HttpException when power production unit is missing', async () => {
      // Arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenPowerProcessStep.executedBy = undefined;
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `Production units not found: powerUnitId [${givenPowerProcessStep.executedBy.id}] or hydrogenUnitId [${givenHydrogenProcessStep.executedBy.id}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).rejects.toThrow(
        expectedErrorMessage,
      );
    });

    it('throws HttpException when hydrogen production unit is missing', async () => {
      // Arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProcessStep.executedBy = undefined;

      const expectedErrorMessage = `Production units not found: powerUnitId [${givenPowerProcessStep.executedBy.id}] or hydrogenUnitId [${givenHydrogenProcessStep.executedBy.id}]`;

      // Act & Assert
      await expect(service.determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });

  describe('areUnitsInSameBiddingZone', () => {
    it('returns true for same zone', () => {
      const powerUnit: any = { biddingZone: BiddingZone.DE_LU };
      const hydrogenUnit: any = { biddingZone: BiddingZone.DE_LU };
      expect(service.areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(true);
    });

    it('returns false for different zones', () => {
      const powerUnit: any = { biddingZone: BiddingZone.DE_LU };
      const hydrogenUnit: any = { biddingZone: BiddingZone.AT };
      expect(service.areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(false);
    });

    it('throws error when a biddingZone is missing', () => {
      const powerUnit: any = { biddingZone: null };
      const hydrogenUnit: any = { biddingZone: BiddingZone.DE_LU };
      expect(() => service.areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toThrow(Error);
    });
  });

  describe('isWithinTimeCorrelation', () => {
    it('returns true if both started within the same rounded hour', () => {
      const power: any = { startedAt: '2025-01-01T10:15:00.000Z' };
      const hydrogen: any = { startedAt: '2025-01-01T10:59:59.000Z' };
      expect(service.isWithinTimeCorrelation(power, hydrogen)).toBe(true);
    });

    it('returns false if started within different hours', () => {
      const power: any = { startedAt: '2025-01-01T10:00:00.000Z' };
      const hydrogen: any = { startedAt: '2025-01-01T11:00:00.000Z' };
      expect(service.isWithinTimeCorrelation(power, hydrogen)).toBe(false);
    });

    it('throws error for invalid dates', () => {
      const power: any = { startedAt: 'invalid-date' };
      const hydrogen: any = { startedAt: '2025-01-01T10:00:00.000Z' };
      expect(() => service.isWithinTimeCorrelation(power, hydrogen)).toThrow(Error);
    });
  });

  describe('meetsAdditionalityCriterion', () => {
    it('returns true if power commissionedOn is within 36 months before hydrogen unit', () => {
      const hydrogen: any = { commissionedOn: '2024-01-01T00:00:00.000Z' };
      const power: any = { commissionedOn: '2022-02-01T00:00:00.000Z' }; // 23 months before
      expect(service.meetsAdditionalityCriterion(power, hydrogen)).toBe(true);
    });

    it('returns false if power commissionedOn is before the 36-month limit', () => {
      const hydrogen: any = { commissionedOn: '2024-01-01T00:00:00.000Z' };
      const power: any = { commissionedOn: '2019-12-31T00:00:00.000Z' }; // > 36 months before
      expect(service.meetsAdditionalityCriterion(power, hydrogen)).toBe(false);
    });

    it('throws error for invalid commissionedOn dates', () => {
      const hydrogen: any = { commissionedOn: 'invalid-date' };
      const power: any = { commissionedOn: '2023-01-01T00:00:00.000Z' };
      expect(() => service.meetsAdditionalityCriterion(power, hydrogen)).toThrow(Error);
    });
  });

  describe('hasFinancialSupport', () => {
    it('reflects financialSupportReceived field', () => {
      expect(service.hasFinancialSupport({ financialSupportReceived: true } as any)).toBe(false);
      expect(service.hasFinancialSupport({ financialSupportReceived: false } as any)).toBe(true);
    });
  });
});
