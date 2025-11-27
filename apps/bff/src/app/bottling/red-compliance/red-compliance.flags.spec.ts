/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { areUnitsInSameBiddingZone, hasFinancialSupport, meetsAdditionalityCriterion, isWithinTimeCorrelation } from './red-compliance.flags';
import { BiddingZone } from '@h2-trust/domain';

describe('red-compliance.flags', () => {
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

    it('throws BAD_REQUEST when a biddingZone is missing', () => {
      const powerUnit: any = { biddingZone: null };
      const hydrogenUnit: any = { biddingZone: BiddingZone.DE_LU };
      expect(() => areUnitsInSameBiddingZone(powerUnit, hydrogenUnit)).toThrow(HttpException);
      try {
        areUnitsInSameBiddingZone(powerUnit, hydrogenUnit);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
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

    it('throws BAD_REQUEST for invalid dates', () => {
      const power: any = { startedAt: 'invalid-date' };
      const hydrogen: any = { startedAt: '2025-01-01T10:00:00.000Z' };
      expect(() => isWithinTimeCorrelation(power, hydrogen)).toThrow(HttpException);
      try {
        isWithinTimeCorrelation(power, hydrogen);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
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

    it('throws BAD_REQUEST for invalid commissionedOn dates', () => {
      const hydrogen: any = { commissionedOn: 'invalid-date' };
      const power: any = { commissionedOn: '2023-01-01T00:00:00.000Z' };
      expect(() => meetsAdditionalityCriterion(power, hydrogen)).toThrow(HttpException);
      try {
        meetsAdditionalityCriterion(power, hydrogen);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('hasFinancialSupport', () => {
    it('reflects financialSupportReceived field', () => {
      expect(hasFinancialSupport({ financialSupportReceived: true } as any)).toBe(true);
      expect(hasFinancialSupport({ financialSupportReceived: false } as any)).toBe(false);
    });
  });
});
