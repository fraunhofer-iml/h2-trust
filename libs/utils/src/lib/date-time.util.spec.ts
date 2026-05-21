/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { convertLocalTimeToUTC, subtractMonthsSafe } from './date-time';

describe('subtractMonthsSafe', () => {
  describe('subtractMonthsSafe', () => {
    describe('basic subtraction', () => {
      it('should subtract one month when given a mid-month date', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 2, 15)); // March 15, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(15);
      });

      it('should subtract multiple months when the result stays within the same year', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 20)); // June 20, 2024

        // act
        const result = subtractMonthsSafe(date, 3);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(2); // March
        expect(result.getUTCDate()).toBe(20);
      });

      it('should preserve the date when subtracting zero months', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, 0);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(5);
        expect(result.getUTCDate()).toBe(15);
      });
    });

    describe('year boundary crossing', () => {
      it('should cross year boundary when subtracting from January', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 0, 15)); // January 15, 2024

        // act
        const result = subtractMonthsSafe(date, 2);

        // assert
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(10); // November
        expect(result.getUTCDate()).toBe(15);
      });

      it('should cross multiple years when subtracting many months', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, 30); // 2.5 years

        // assert
        expect(result.getUTCFullYear()).toBe(2021);
        expect(result.getUTCMonth()).toBe(11); // December
        expect(result.getUTCDate()).toBe(15);
      });

      it('should preserve month and day when subtracting exactly 12 months', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, 12);

        // assert
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });
    });

    describe('day clamping for shorter months', () => {
      it('should clamp day when target month has fewer days (March 31 -> Feb 29 in leap year)', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 2, 31)); // March 31, 2024 (leap year)

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // leap year has 29 days
      });

      it('should clamp day when target month has fewer days (March 31 -> Feb 28 in non-leap year)', () => {
        // arrange
        const date = new Date(Date.UTC(2023, 2, 31)); // March 31, 2023 (non-leap year)

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(28); // not a leap year
      });

      it('should clamp day when going from 31-day month to 30-day month', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 4, 31)); // May 31, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(3); // April
        expect(result.getUTCDate()).toBe(30); // April has only 30 days
      });

      it('should not clamp day when target month has enough days', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 3, 30)); // April 30, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(2); // March
        expect(result.getUTCDate()).toBe(30); // March has 31 days
      });
    });

    describe('leap year handling', () => {
      it('should clamp Feb 29 to Feb 28 when subtracting 12 months from a leap year date', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 1, 29)); // February 29, 2024

        // act
        const result = subtractMonthsSafe(date, 12);

        // assert
        expect(result.getUTCFullYear()).toBe(2023);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(28); // 2023 is not a leap year
      });

      it('should return Feb 29 when subtracting into February of a leap year', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 2, 29)); // March 29, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // 2024 is a leap year
      });
    });

    describe('edge cases', () => {
      it('should preserve the first day when subtracting from the first day of a month', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 1)); // June 1, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(4); // May
        expect(result.getUTCDate()).toBe(1);
      });

      it('should clamp the day when subtracting from the last day of December', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 11, 31)); // December 31, 2024

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(10); // November
        expect(result.getUTCDate()).toBe(30); // November has only 30 days
      });

      it('should subtract large month values when many years are crossed', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, 120); // 10 years

        // assert
        expect(result.getUTCFullYear()).toBe(2014);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });

      it('should return UTC midnight when the source date contains a time component', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15, 14, 30, 45, 123)); // with time

        // act
        const result = subtractMonthsSafe(date, 1);

        // assert
        expect(result.getUTCHours()).toBe(0);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getUTCMilliseconds()).toBe(0);
      });
    });

    describe('input validation', () => {
      it('should throw error when date is undefined', () => {
        // arrange
        const date = undefined as unknown as Date;
        const months = 1;

        // act & assert
        expect(() => subtractMonthsSafe(date, months)).toThrow();
      });

      it('should throw error when date is null', () => {
        // arrange
        const date = null as unknown as Date;
        const months = 1;

        // act & assert
        expect(() => subtractMonthsSafe(date, months)).toThrow();
      });

      it('should throw error when months is undefined', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 5, 15));
        const months = undefined as unknown as number;

        // act & assert
        expect(() => subtractMonthsSafe(date, months)).toThrow();
      });

      it('should throw error when months is null', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 5, 15));
        const months = null as unknown as number;

        // act & assert
        expect(() => subtractMonthsSafe(date, months)).toThrow();
      });
    });

    describe('negative months (addition)', () => {
      it('should add months when a negative month value is provided', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, -1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(6); // July
        expect(result.getUTCDate()).toBe(15);
      });

      it('should cross the year boundary when adding months via a negative month value', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 10, 15)); // November 15, 2024

        // act
        const result = subtractMonthsSafe(date, -3);

        // assert
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(15);
      });

      it('should clamp day when adding months to shorter target month', () => {
        // arrange
        const date = new Date(Date.UTC(2024, 0, 31)); // January 31, 2024

        // act
        const result = subtractMonthsSafe(date, -1);

        // assert
        expect(result.getUTCFullYear()).toBe(2024);
        expect(result.getUTCMonth()).toBe(1); // February
        expect(result.getUTCDate()).toBe(29); // clamped to Feb 29 (leap year)
      });

      it('should add large month values when a large negative month value is provided', () => {
      // arrange
        const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const result = subtractMonthsSafe(date, -120); // 10 years forward

        // assert
        expect(result.getUTCFullYear()).toBe(2034);
        expect(result.getUTCMonth()).toBe(5); // June
        expect(result.getUTCDate()).toBe(15);
      });
    });
  });

  describe('parseLocalTimeToUTC', () => {
    it('should convert Europe/Brlin CEST local time to UTC when given a localized date string', () => {
    // arrange
      const dateString = '01.12.2025 11:00';
      const timeZone = 'Europe/Berlin';

      // act
      const result = convertLocalTimeToUTC(dateString, timeZone);

      // assert
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCHours()).toBe(10);
    });

    it('should convert Europe/Brlin CET local time to UTC when given a localized date string', () => {
    // arrange
      const dateString = '01.05.2025 11:00';
      const timeZone = 'Europe/Berlin';

      // act
      const result = convertLocalTimeToUTC(dateString, timeZone);

      // assert
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(4);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCHours()).toBe(9);
    });

    it('should convert milliseconds to UTC when given a timestamp number', () => {
    // arrange
      //number of ms for 01.12.2025 11:00
      const numberOfMs = 1764586800000;
      const timeZone = 'Europe/Berlin';

      // act
      const result = convertLocalTimeToUTC(numberOfMs, timeZone);

      // assert
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCHours()).toBe(10);
    });

    it('should convert an ISO string to UTC when given a non-UTC time zone', () => {
    // arrange
      const isoTime = '2025-12-01T11:00:00.000Z';
      const timeZone = 'Europe/Berlin';

      // act
      const result = convertLocalTimeToUTC(isoTime, timeZone);

      // assert
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCHours()).toBe(10);
    });

    it('should not convert the time when the ISO input is already in UTC format', () => {
    // arrange
      const isoTime = '2025-12-01T11:00:00.000Z';
      const timeZone = 'UTC';

      // act
      const result = convertLocalTimeToUTC(isoTime, timeZone);

      // assert
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCDate()).toBe(1);
      expect(result.getUTCHours()).toBe(11);
    });

    it('should throw when given an invalid time zone input', () => {
    // arrange
      const dateString = '01.05.2025 11:00';
      const invalidTimeZone = 'invalid';

      // act & assert
      expect(() => convertLocalTimeToUTC(dateString, invalidTimeZone)).toThrow();
    });
  });
});
