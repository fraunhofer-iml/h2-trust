/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  RedComplianceEntity,
} from '@h2-trust/contracts/entities';
import {
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BiddingZone } from '@h2-trust/domain';
import {
  areUnitsInSameBiddingZone,
  determineRedCompliance,
  determineTotalRedCompliance,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from './red-compliance';

describe('RedCompliance', () => {
  describe('determineRedCompliance', () => {
    it('should throw when both process steps are missing', () => {
      // arrange
      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      expect(() => determineRedCompliance(undefined, undefined)).toThrow(expectedErrorMessage);
    });

    it('should throw when the power production is missing', () => {
      // arrange
      const hydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      expect(() => determineRedCompliance(hydrogenProduction, undefined)).toThrow(expectedErrorMessage);
    });

    it('should throw when the hydrogen production is missing', () => {
      // arrange
      const powerProduction = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      expect(() => determineRedCompliance(undefined, powerProduction)).toThrow(expectedErrorMessage);
    });

    it('should return RedComplianceEntity with all flags true when all compliance criteria are met', () => {
      // arrange
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

      // act
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // assert
      expect(actualResult).toBeInstanceOf(RedComplianceEntity);
      expect(actualResult.isGeoCorrelationValid).toBe(true);
      expect(actualResult.isTimeCorrelationValid).toBe(true);
      expect(actualResult.isAdditionalityFulfilled).toBe(true);
      expect(actualResult.financialSupportReceived).toBe(true);
    });

    it('should return RedComplianceEntity with isGeoCorrelationValid false when units are in different bidding zones', () => {
      // arrange
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

      // act
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // assert
      expect(actualResult.isGeoCorrelationValid).toBe(false);
    });

    it('should return RedComplianceEntity with isTimeCorrelationValid false when productions are not within time correlation', () => {
      // arrange
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

      // act
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // assert
      expect(actualResult.isTimeCorrelationValid).toBe(false);
    });

    it('should return RedComplianceEntity with isAdditionalityFulfilled false when additionality criterion is not met', () => {
      // arrange
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

      // act
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // assert
      expect(actualResult.isAdditionalityFulfilled).toBe(false);
    });

    it('should return RedComplianceEntity with financialSupportReceived false when financial support was received', () => {
      // arrange
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

      // act
      const actualResult = determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      // assert
      expect(actualResult.financialSupportReceived).toBe(false);
    });

    it('should throw when the power production unit is missing', () => {
      // arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      givenPowerProcessStep.executedBy = undefined;
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      expect(() => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).toThrow(
        expectedErrorMessage,
      );
    });

    it('should throw when the hydrogen production unit is missing', () => {
      // arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProcessStep.executedBy = undefined;

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      expect(() => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep)).toThrow(
        expectedErrorMessage,
      );
    });
  });

  describe('determineTotalRedCompliance', () => {
    it('should return true for all flags when no production chains are given', () => {
      const actualResult = determineTotalRedCompliance([]);

      expect(actualResult).toEqual(
        expect.objectContaining({
          isGeoCorrelationValid: true,
          isTimeCorrelationValid: true,
          isAdditionalityFulfilled: true,
          financialSupportReceived: true,
        }),
      );
    });

    it('should aggregate false values across all production chains when called', () => {
      const fullyCompliantChain: ProductionChainEntity = {
        powerProductionUnit: PowerProductionUnitEntityFixture.create({
          biddingZone: BiddingZone.DE_LU,
          commissionedOn: new Date('2025-01-01T00:00:00Z'),
          financialSupportReceived: false,
        }),
        hydrogenProductionUnit: HydrogenProductionUnitEntityFixture.create({
          biddingZone: BiddingZone.DE_LU,
          commissionedOn: new Date('2026-01-01T00:00:00Z'),
        }),
        powerProduction: ProcessStepEntityFixture.createPowerProduction({
          startedAt: new Date('2026-02-01T10:00:00Z'),
        }),
        hydrogenRootProduction: ProcessStepEntityFixture.createHydrogenProduction({
          startedAt: new Date('2026-02-01T10:30:00Z'),
        }),
      } as ProductionChainEntity;
      const failingChain: ProductionChainEntity = {
        powerProductionUnit: PowerProductionUnitEntityFixture.create({
          biddingZone: BiddingZone.BE,
          commissionedOn: new Date('2020-01-01T00:00:00Z'),
          financialSupportReceived: true,
        }),
        hydrogenProductionUnit: HydrogenProductionUnitEntityFixture.create({
          biddingZone: BiddingZone.DE_LU,
          commissionedOn: new Date('2026-01-01T00:00:00Z'),
        }),
        powerProduction: ProcessStepEntityFixture.createPowerProduction({
          startedAt: new Date('2026-02-01T08:00:00Z'),
        }),
        hydrogenRootProduction: ProcessStepEntityFixture.createHydrogenProduction({
          startedAt: new Date('2026-02-01T10:00:00Z'),
        }),
      } as ProductionChainEntity;

      const actualResult = determineTotalRedCompliance([fullyCompliantChain, failingChain]);

      expect(actualResult).toEqual(
        expect.objectContaining({
          isGeoCorrelationValid: false,
          isTimeCorrelationValid: false,
          isAdditionalityFulfilled: false,
          financialSupportReceived: false,
        }),
      );
    });
  });

  describe('areUnitsInSameBiddingZone', () => {
    it('should return true when both units are in the same zone', () => {
      const powerUnit = { biddingZone: BiddingZone.DE_LU } as PowerProductionUnitEntity;
      const hydrogenUnit = { biddingZone: BiddingZone.DE_LU } as HydrogenProductionUnitEntity;
      expect(areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(true);
    });

    it('should return false when units are in different zones', () => {
      const powerUnit = { biddingZone: BiddingZone.DE_LU } as PowerProductionUnitEntity;
      const hydrogenUnit = { biddingZone: BiddingZone.AT } as HydrogenProductionUnitEntity;
      expect(areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toBe(false);
    });

    it('should throw error when a biddingZone is missing', () => {
      const powerUnit = { biddingZone: null } as unknown as PowerProductionUnitEntity;
      const hydrogenUnit = { biddingZone: BiddingZone.DE_LU } as HydrogenProductionUnitEntity;
      expect(() => areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toThrow(Error);
    });
  });

  describe('isWithinTimeCorrelation', () => {
    it('should return true when both started within the same rounded hour', () => {
      const power = { startedAt: '2025-01-01T10:15:00.000Z' } as unknown as ProcessStepEntity;
      const hydrogen = { startedAt: '2025-01-01T10:59:59.000Z' } as unknown as ProcessStepEntity;
      expect(isWithinTimeCorrelation(power, hydrogen)).toBe(true);
    });

    it('should return false when started within different hours', () => {
      const power = { startedAt: '2025-01-01T10:00:00.000Z' } as unknown as ProcessStepEntity;
      const hydrogen = { startedAt: '2025-01-01T11:00:00.000Z' } as unknown as ProcessStepEntity;
      expect(isWithinTimeCorrelation(power, hydrogen)).toBe(false);
    });

    it('should throw error for invalid dates when called', () => {
      const power = { startedAt: 'invalid-date' } as unknown as ProcessStepEntity;
      const hydrogen = { startedAt: '2025-01-01T10:00:00.000Z' } as unknown as ProcessStepEntity;
      expect(() => isWithinTimeCorrelation(power, hydrogen)).toThrow(Error);
    });
  });

  describe('meetsAdditionalityCriterion', () => {
    it('should return true when power commissionedOn is within 36 months before hydrogen unit', () => {
      const hydrogen = { commissionedOn: '2024-01-01T00:00:00.000Z' } as unknown as HydrogenProductionUnitEntity;
      const power = { commissionedOn: '2022-02-01T00:00:00.000Z' } as unknown as PowerProductionUnitEntity; // 23 months before
      expect(meetsAdditionalityCriterion(power, hydrogen)).toBe(true);
    });

    it('should return false when power commissionedOn is before the 36-month limit', () => {
      const hydrogen = { commissionedOn: '2024-01-01T00:00:00.000Z' } as unknown as HydrogenProductionUnitEntity;
      const power = { commissionedOn: '2019-12-31T00:00:00.000Z' } as unknown as PowerProductionUnitEntity; // > 36 months before
      expect(meetsAdditionalityCriterion(power, hydrogen)).toBe(false);
    });

    it('should throw error for invalid commissionedOn dates when called', () => {
      const hydrogen = { commissionedOn: 'invalid-date' } as unknown as HydrogenProductionUnitEntity;
      const power = { commissionedOn: '2023-01-01T00:00:00.000Z' } as unknown as PowerProductionUnitEntity;
      expect(() => meetsAdditionalityCriterion(power, hydrogen)).toThrow(Error);
    });
  });

  describe('hasFinancialSupport', () => {
    it('should reflect financialSupportReceived field when called', () => {
      expect(hasFinancialSupport({ financialSupportReceived: true } as PowerProductionUnitEntity)).toBe(false);
      expect(hasFinancialSupport({ financialSupportReceived: false } as PowerProductionUnitEntity)).toBe(true);
    });
  });
});
