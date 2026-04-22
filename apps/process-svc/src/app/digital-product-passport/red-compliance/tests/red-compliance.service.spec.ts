/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RedComplianceEntity } from '@h2-trust/contracts/entities';
import {
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BiddingZone } from '@h2-trust/domain';
import {
  areUnitsInSameBiddingZone,
  determineRedCompliance,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from '../red-compliance.service';

describe('RedComplianceService', () => {
  describe('determineRedCompliance', () => {
    it('throws RpcException when provenance is null', () => {
      // Arrange
      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // Act & Assert
      expect(() => determineRedCompliance(undefined, undefined)).toThrow(expectedErrorMessage);
    });

    it('throws RpcException when powerProductions is empty', () => {
      // Arrange
      const hydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // Act & Assert
      expect(() => determineRedCompliance(hydrogenProduction, undefined)).toThrow(expectedErrorMessage);
    });

    it('throws RpcException when hydrogenProductions is empty', () => {
      // Arrange
      const powerProduction = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // Act & Assert
      expect(() => determineRedCompliance(undefined, powerProduction)).toThrow(expectedErrorMessage);
    });

    it('returns RedComplianceEntity with all flags true when all compliance criteria are met', () => {
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
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult).toBeInstanceOf(RedComplianceEntity);
      expect(actualResult.isGeoCorrelationValid).toBe(true);
      expect(actualResult.isTimeCorrelationValid).toBe(true);
      expect(actualResult.isAdditionalityFulfilled).toBe(true);
      expect(actualResult.financialSupportReceived).toBe(true);
    });

    it('returns RedComplianceEntity with isGeoCorrelationValid false when units are in different bidding zones', () => {
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
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isGeoCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isTimeCorrelationValid false when productions are not within time correlation', () => {
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
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isTimeCorrelationValid).toBe(false);
    });

    it('returns RedComplianceEntity with isAdditionalityFulfilled false when additionality criterion is not met', () => {
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
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.isAdditionalityFulfilled).toBe(false);
    });

    it('returns RedComplianceEntity with financialSupportReceived false when financial support was received', () => {
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
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // Assert
      expect(actualResult.financialSupportReceived).toBe(false);
    });

    it('throws HttpException when power production unit is missing', () => {
      // Arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenPowerProcessStep.executedBy = undefined;
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // Act & Assert
      expect(() => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).toThrow(
        expectedErrorMessage,
      );
    });

    it('throws HttpException when hydrogen production unit is missing', () => {
      // Arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProcessStep.executedBy = undefined;

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // Act & Assert
      expect(() => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).toThrow(
        expectedErrorMessage,
      );
    });
  });

  describe('areUnitsInSameBiddingZone', () => {
    it('returns true for same zone', () => {
      const powerUnit: any = { biddingZone: BiddingZone.DE_LU };
      const hydrogenUnit: any = { biddingZone: BiddingZone.DE_LU };
      expect(areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(true);
    });

    it('returns false for different zones', () => {
      const powerUnit: any = { biddingZone: BiddingZone.DE_LU };
      const hydrogenUnit: any = { biddingZone: BiddingZone.AT };
      expect(areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(false);
    });

    it('throws error when a biddingZone is missing', () => {
      const powerUnit: any = { biddingZone: null };
      const hydrogenUnit: any = { biddingZone: BiddingZone.DE_LU };
      expect(() => areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toThrow(Error);
    });
  });

  describe('isWithinTimeCorrelation', () => {
    it('returns true if both started within the same rounded hour', () => {
      const power: any = { startedAt: '2025-01-01T10:15:00.000Z' };
      const hydrogen: any = { startedAt: '2025-01-01T10:59:59.000Z' };
      expect(isWithinTimeCorrelation(power, hydrogen)).toBe(true);
    });

    it('returns false if started within different hours', () => {
      const power: any = { startedAt: '2025-01-01T10:00:00.000Z' };
      const hydrogen: any = { startedAt: '2025-01-01T11:00:00.000Z' };
      expect(isWithinTimeCorrelation(power, hydrogen)).toBe(false);
    });

    it('throws error for invalid dates', () => {
      const power: any = { startedAt: 'invalid-date' };
      const hydrogen: any = { startedAt: '2025-01-01T10:00:00.000Z' };
      expect(() => isWithinTimeCorrelation(power, hydrogen)).toThrow(Error);
    });
  });

  describe('meetsAdditionalityCriterion', () => {
    it('returns true if power commissionedOn is within 36 months before hydrogen unit', () => {
      const hydrogen: any = { commissionedOn: '2024-01-01T00:00:00.000Z' };
      const power: any = { commissionedOn: '2022-02-01T00:00:00.000Z' }; // 23 months before
      expect(meetsAdditionalityCriterion(power, hydrogen)).toBe(true);
    });

    it('returns false if power commissionedOn is before the 36-month limit', () => {
      const hydrogen: any = { commissionedOn: '2024-01-01T00:00:00.000Z' };
      const power: any = { commissionedOn: '2019-12-31T00:00:00.000Z' }; // > 36 months before
      expect(meetsAdditionalityCriterion(power, hydrogen)).toBe(false);
    });

    it('throws error for invalid commissionedOn dates', () => {
      const hydrogen: any = { commissionedOn: 'invalid-date' };
      const power: any = { commissionedOn: '2023-01-01T00:00:00.000Z' };
      expect(() => meetsAdditionalityCriterion(power, hydrogen)).toThrow(Error);
    });
  });

  describe('hasFinancialSupport', () => {
    it('reflects financialSupportReceived field', () => {
      expect(hasFinancialSupport({ financialSupportReceived: true } as any)).toBe(false);
      expect(hasFinancialSupport({ financialSupportReceived: false } as any)).toBe(true);
    });
  });
});
