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
      const actualOperation = () => determineRedCompliance(undefined, undefined);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });

    it('should throw when the power production is missing', () => {
      // arrange
      const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      const actualOperation = () => determineRedCompliance(givenHydrogenProduction, undefined);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });

    it('should throw when the hydrogen production is missing', () => {
      // arrange
      const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      const actualOperation = () => determineRedCompliance(undefined, givenPowerProduction);

      expect(actualOperation).toThrow(expectedErrorMessage);
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
      const actualOperation = () => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });

    it('should throw when the hydrogen production unit is missing', () => {
      // arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      givenHydrogenProcessStep.executedBy = undefined;

      const expectedErrorMessage = `The passed-in power production or hydrogen production do not have an executedBy unit specified.`;

      // act & assert
      const actualOperation = () => determineRedCompliance(givenHydrogenProcessStep, givenPowerProcessStep);

      expect(actualOperation).toThrow(expectedErrorMessage);
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
      const givenFullyCompliantChain: ProductionChainEntity = {
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
      const givenFailingChain: ProductionChainEntity = {
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

      const actualResult = determineTotalRedCompliance([givenFullyCompliantChain, givenFailingChain]);

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
      const givenPowerUnit = { biddingZone: BiddingZone.DE_LU } as PowerProductionUnitEntity;
      const givenHydrogenUnit = { biddingZone: BiddingZone.DE_LU } as HydrogenProductionUnitEntity;
      expect(areUnitsInSameBiddingZone(givenPowerUnit, givenHydrogenUnit)).toBe(true);
    });

    it('should return false when units are in different zones', () => {
      const givenPowerUnit = { biddingZone: BiddingZone.DE_LU } as PowerProductionUnitEntity;
      const givenHydrogenUnit = { biddingZone: BiddingZone.AT } as HydrogenProductionUnitEntity;
      expect(areUnitsInSameBiddingZone(givenPowerUnit, givenHydrogenUnit)).toBe(false);
    });

    it('should throw error when a biddingZone is missing', () => {
      const givenPowerUnit = { biddingZone: null } as unknown as PowerProductionUnitEntity;
      const givenHydrogenUnit = { biddingZone: BiddingZone.DE_LU } as HydrogenProductionUnitEntity;
      expect(() => areUnitsInSameBiddingZone(givenPowerUnit, givenHydrogenUnit)).toThrow(Error);
    });
  });

  describe('isWithinTimeCorrelation', () => {
    it('should return true when both started within the same rounded hour', () => {
      const givenPower = { startedAt: '2025-01-01T10:15:00.000Z' } as unknown as ProcessStepEntity;
      const givenHydrogen = { startedAt: '2025-01-01T10:59:59.000Z' } as unknown as ProcessStepEntity;
      expect(isWithinTimeCorrelation(givenPower, givenHydrogen)).toBe(true);
    });

    it('should return false when started within different hours', () => {
      const givenPower = { startedAt: '2025-01-01T10:00:00.000Z' } as unknown as ProcessStepEntity;
      const givenHydrogen = { startedAt: '2025-01-01T11:00:00.000Z' } as unknown as ProcessStepEntity;
      expect(isWithinTimeCorrelation(givenPower, givenHydrogen)).toBe(false);
    });

    it('should throw error for invalid dates when called', () => {
      const givenPower = { startedAt: 'invalid-date' } as unknown as ProcessStepEntity;
      const givenHydrogen = { startedAt: '2025-01-01T10:00:00.000Z' } as unknown as ProcessStepEntity;
      expect(() => isWithinTimeCorrelation(givenPower, givenHydrogen)).toThrow(Error);
    });
  });

  describe('meetsAdditionalityCriterion', () => {
    it('should return true when power commissionedOn is within 36 months before hydrogen unit', () => {
      const givenHydrogen = { commissionedOn: '2024-01-01T00:00:00.000Z' } as unknown as HydrogenProductionUnitEntity;
      const givenPower = { commissionedOn: '2022-02-01T00:00:00.000Z' } as unknown as PowerProductionUnitEntity; // 23 months before
      expect(meetsAdditionalityCriterion(givenPower, givenHydrogen)).toBe(true);
    });

    it('should return false when power commissionedOn is before the 36-month limit', () => {
      const givenHydrogen = { commissionedOn: '2024-01-01T00:00:00.000Z' } as unknown as HydrogenProductionUnitEntity;
      const givenPower = { commissionedOn: '2019-12-31T00:00:00.000Z' } as unknown as PowerProductionUnitEntity; // > 36 months before
      expect(meetsAdditionalityCriterion(givenPower, givenHydrogen)).toBe(false);
    });

    it('should throw error for invalid commissionedOn dates when called', () => {
      const givenHydrogen = { commissionedOn: 'invalid-date' } as unknown as HydrogenProductionUnitEntity;
      const givenPower = { commissionedOn: '2023-01-01T00:00:00.000Z' } as unknown as PowerProductionUnitEntity;
      expect(() => meetsAdditionalityCriterion(givenPower, givenHydrogen)).toThrow(Error);
    });
  });

  describe('hasFinancialSupport', () => {
    it('should reflect financialSupportReceived field when called', () => {
      expect(hasFinancialSupport({ financialSupportReceived: true } as PowerProductionUnitEntity)).toBe(false);
      expect(hasFinancialSupport({ financialSupportReceived: false } as PowerProductionUnitEntity)).toBe(true);
    });
  });
});
