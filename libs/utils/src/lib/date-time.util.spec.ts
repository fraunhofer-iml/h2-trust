/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateTimeUtil } from './date-time.util';

describe('DateTimeUtil', () => {
  describe('subtractMonthsSafe', () => {
    describe('basic subtraction', () => {
      it('should subtract one month from a mid-month date', () => {
        const date = new Date(Date.UTC(2024, 2, 15)); // March 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(15);
      });

      it('should subtract multiple months within same year', () => {
        const date = new Date(Date.UTC(2024, 5, 20)); // June 20, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 3);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(2); // March
        expect(result.getUTCDate()).toBe(20);
      });

      it('should handle zero months subtraction', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 0);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
      });
    });

    describe('year boundary crossing', () => {
      it('should cross year boundary when subtracting from January', () => {
        const date = new Date(Date.UTC(2024, 0, 15)); // January 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 2);

        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(10); // November
        expect(result.getUTCDate()).toBe(15);
      });

      it('should cross multiple years when subtracting many months', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 30); // 2.5 years

        expect(result.getUTCFullYear()).toBe(2021);
        expect(result.getUTCMonth()).toBe(11); // December
        expect(result.getUTCDate()).toBe(15);
      });

      it('should handle exactly 12 months subtraction', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 12);

        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });
    });

    describe('day clamping for shorter months', () => {
      it('should clamp day when target month has fewer days (March 31 -> Feb 29 in leap year)', () => {
        const date = new Date(Date.UTC(2024, 2, 31)); // March 31, 2024 (leap year)
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // leap year has 29 days
      });

      it('should clamp day when target month has fewer days (March 31 -> Feb 28 in non-leap year)', () => {
        const date = new Date(Date.UTC(2023, 2, 31)); // March 31, 2023 (non-leap year)
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(28); // not a leap year
      });

      it('should clamp day when going from 31-day month to 30-day month', () => {
        const date = new Date(Date.UTC(2024, 4, 31)); // May 31, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(3); // April
        expect(result.getUTCDate()).toBe(30); // April has only 30 days
      });

      it('should not clamp day when target month has enough days', () => {
        const date = new Date(Date.UTC(2024, 3, 30)); // April 30, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(2); // March
        expect(result.getUTCDate()).toBe(30); // March has 31 days
      });
    });

    describe('leap year handling', () => {
      it('should handle Feb 29 in leap year correctly', () => {
        const date = new Date(Date.UTC(2024, 1, 29)); // February 29, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 12);

        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(28); // 2023 is not a leap year
      });

      it('should handle subtraction to Feb 29 in leap year', () => {
        const date = new Date(Date.UTC(2024, 2, 29)); // March 29, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // 2024 is a leap year
      });
    });

    describe('edge cases', () => {
      it('should handle first day of month', () => {
        const date = new Date(Date.UTC(2024, 5, 1)); // June 1, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(4); // May
        expect(result.getUTCDate()).toBe(1);
      });

      it('should handle last day of December', () => {
        const date = new Date(Date.UTC(2024, 11, 31)); // December 31, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(10); // November
        expect(result.getUTCDate()).toBe(30); // November has only 30 days
      });

      it('should handle very large month values', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, 120); // 10 years

        expect(result.getUTCFullYear()).toBe(2014);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });

      it('should return UTC midnight time', () => {
        const date = new Date(Date.UTC(2024, 5, 15, 14, 30, 45, 123)); // with time
        const result = DateTimeUtil.subtractMonthsSafe(date, 1);

        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
      });
    });

    describe('input validation', () => {
      it('should throw error when date is undefined', () => {
        expect(() => DateTimeUtil.subtractMonthsSafe(undefined as unknown as Date, 1)).toThrow();
      });

      it('should throw error when date is null', () => {
        expect(() => DateTimeUtil.subtractMonthsSafe(null as unknown as Date, 1)).toThrow();
      });

      it('should throw error when months is undefined', () => {
        const date = new Date(Date.UTC(2024, 5, 15));
        expect(() => DateTimeUtil.subtractMonthsSafe(date, undefined as unknown as number)).toThrow();
      });

      it('should throw error when months is null', () => {
        const date = new Date(Date.UTC(2024, 5, 15));
        expect(() => DateTimeUtil.subtractMonthsSafe(date, null as unknown as number)).toThrow();
      });
    });

    describe('negative months (addition)', () => {
      it('should handle negative months as addition', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, -1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(6); // July
        expect(result.getUTCDate()).toBe(15);
      });

      it('should handle negative months crossing year boundary', () => {
        const date = new Date(Date.UTC(2024, 10, 15)); // November 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, -3);

        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(15);
      });

      it('should clamp day when adding months to shorter target month', () => {
        const date = new Date(Date.UTC(2024, 0, 31)); // January 31, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, -1);

        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // clamped to Feb 29 (leap year)
      });

      it('should handle very large negative month values', () => {
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
        const result = DateTimeUtil.subtractMonthsSafe(date, -120); // 10 years forward

        expect(result.getUTCFullYear()).toBe(2034);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });
    });
  });
});
