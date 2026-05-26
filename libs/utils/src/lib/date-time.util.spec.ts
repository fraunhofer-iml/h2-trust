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
        const givenDate = new Date(Date.UTC(2024, 2, 15)); // March 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should subtract multiple months when the result stays within the same year', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 20)); // June 20, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 3);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(2); // March
        expect(actualResult.getUTCDate()).toBe(20);
      });

      it('should preserve the date when subtracting zero months', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 0);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(5);
        expect(actualResult.getUTCDate()).toBe(15);
      });
    });

    describe('year boundary crossing', () => {
      it('should cross year boundary when subtracting from January', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 0, 15)); // January 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 2);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2023);
        expect(actualResult.getUTCMonth()).toBe(10); // November
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should cross multiple years when subtracting many months', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 30); // 2.5 years

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2021);
        expect(actualResult.getUTCMonth()).toBe(11); // December
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should preserve month and day when subtracting exactly 12 months', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 12);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2023);
        expect(actualResult.getUTCMonth()).toBe(5); // June
        expect(actualResult.getUTCDate()).toBe(15);
      });
    });

    describe('day clamping for shorter months', () => {
      it('should clamp day when target month has fewer days (March 31 -> Feb 29 in leap year)', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 2, 31)); // March 31, 2024 (leap year)

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(29); // leap year has 29 days
      });

      it('should clamp day when target month has fewer days (March 31 -> Feb 28 in non-leap year)', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2023, 2, 31)); // March 31, 2023 (non-leap year)

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2023);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(28); // not a leap year
      });

      it('should clamp day when going from 31-day month to 30-day month', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 4, 31)); // May 31, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(3); // April
        expect(actualResult.getUTCDate()).toBe(30); // April has only 30 days
      });

      it('should not clamp day when target month has enough days', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 3, 30)); // April 30, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(2); // March
        expect(actualResult.getUTCDate()).toBe(30); // March has 31 days
      });
    });

    describe('leap year handling', () => {
      it('should clamp Feb 29 to Feb 28 when subtracting 12 months from a leap year date', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 1, 29)); // February 29, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 12);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2023);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(28); // 2023 is not a leap year
      });

      it('should return Feb 29 when subtracting into February of a leap year', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 2, 29)); // March 29, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(29); // 2024 is a leap year
      });
    });

    describe('edge cases', () => {
      it('should preserve the first day when subtracting from the first day of a month', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 1)); // June 1, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(4); // May
        expect(actualResult.getUTCDate()).toBe(1);
      });

      it('should clamp the day when subtracting from the last day of December', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 11, 31)); // December 31, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(10); // November
        expect(actualResult.getUTCDate()).toBe(30); // November has only 30 days
      });

      it('should subtract large month values when many years are crossed', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, 120); // 10 years

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2014);
        expect(actualResult.getUTCMonth()).toBe(5); // June
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should return UTC midnight when the source date contains a time component', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15, 14, 30, 45, 123)); // with time

        // act
        const actualResult = subtractMonthsSafe(givenDate, 1);

        // assert
        expect(actualResult.getUTCHours()).toBe(0);
        expect(actualResult.getUTCMinutes()).toBe(0);
        expect(actualResult.getUTCSeconds()).toBe(0);
        expect(actualResult.getUTCMilliseconds()).toBe(0);
      });
    });

    describe('input validation', () => {
      it('should throw error when date is undefined', () => {
        // arrange
        const givenDate = undefined as unknown as Date;
        const givenMonths = 1;

        // act & assert
        const actualOperation = () => subtractMonthsSafe(givenDate, givenMonths);

        expect(actualOperation).toThrow();
      });

      it('should throw error when date is null', () => {
        // arrange
        const givenDate = null as unknown as Date;
        const givenMonths = 1;

        // act & assert
        const actualOperation = () => subtractMonthsSafe(givenDate, givenMonths);

        expect(actualOperation).toThrow();
      });

      it('should throw error when months is undefined', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15));
        const givenMonths = undefined as unknown as number;

        // act & assert
        const actualOperation = () => subtractMonthsSafe(givenDate, givenMonths);

        expect(actualOperation).toThrow();
      });

      it('should throw error when months is null', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15));
        const givenMonths = null as unknown as number;

        // act & assert
        const actualOperation = () => subtractMonthsSafe(givenDate, givenMonths);

        expect(actualOperation).toThrow();
      });
    });

    describe('negative months (addition)', () => {
      it('should add months when a negative month value is provided', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, -1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(6); // July
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should cross the year boundary when adding months via a negative month value', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 10, 15)); // November 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, -3);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2025);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(15);
      });

      it('should clamp day when adding months to shorter target month', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 0, 31)); // January 31, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, -1);

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2024);
        expect(actualResult.getUTCMonth()).toBe(1); // February
        expect(actualResult.getUTCDate()).toBe(29); // clamped to Feb 29 (leap year)
      });

      it('should add large month values when a large negative month value is provided', () => {
        // arrange
        const givenDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024

        // act
        const actualResult = subtractMonthsSafe(givenDate, -120); // 10 years forward

        // assert
        expect(actualResult.getUTCFullYear()).toBe(2034);
        expect(actualResult.getUTCMonth()).toBe(5); // June
        expect(actualResult.getUTCDate()).toBe(15);
      });
    });
  });

  describe('parseLocalTimeToUTC', () => {
    it('should convert Europe/Brlin CEST local time to UTC when given a localized date string', () => {
      // arrange
      const givenDateString = '01.12.2025 11:00';
      const givenTimeZone = 'Europe/Berlin';

      // act
      const actualResult = convertLocalTimeToUTC(givenDateString, givenTimeZone);

      // assert
      expect(actualResult.getUTCFullYear()).toBe(2025);
      expect(actualResult.getUTCMonth()).toBe(11);
      expect(actualResult.getUTCDate()).toBe(1);
      expect(actualResult.getUTCHours()).toBe(10);
    });

    it('should convert Europe/Brlin CET local time to UTC when given a localized date string', () => {
      // arrange
      const givenDateString = '01.05.2025 11:00';
      const givenTimeZone = 'Europe/Berlin';

      // act
      const actualResult = convertLocalTimeToUTC(givenDateString, givenTimeZone);

      // assert
      expect(actualResult.getUTCFullYear()).toBe(2025);
      expect(actualResult.getUTCMonth()).toBe(4);
      expect(actualResult.getUTCDate()).toBe(1);
      expect(actualResult.getUTCHours()).toBe(9);
    });

    it('should convert milliseconds to UTC when given a timestamp number', () => {
      // arrange
      //number of ms for 01.12.2025 11:00
      const givenNumberOfMs = 1764586800000;
      const givenTimeZone = 'Europe/Berlin';

      // act
      const actualResult = convertLocalTimeToUTC(givenNumberOfMs, givenTimeZone);

      // assert
      expect(actualResult.getUTCFullYear()).toBe(2025);
      expect(actualResult.getUTCMonth()).toBe(11);
      expect(actualResult.getUTCDate()).toBe(1);
      expect(actualResult.getUTCHours()).toBe(10);
    });

    it('should convert an ISO string to UTC when given a non-UTC time zone', () => {
      // arrange
      const givenIsoTime = '2025-12-01T11:00:00.000Z';
      const givenTimeZone = 'Europe/Berlin';

      // act
      const actualResult = convertLocalTimeToUTC(givenIsoTime, givenTimeZone);

      // assert
      expect(actualResult.getUTCFullYear()).toBe(2025);
      expect(actualResult.getUTCMonth()).toBe(11);
      expect(actualResult.getUTCDate()).toBe(1);
      expect(actualResult.getUTCHours()).toBe(10);
    });

    it('should not convert the time when the ISO input is already in UTC format', () => {
      // arrange
      const givenIsoTime = '2025-12-01T11:00:00.000Z';
      const givenTimeZone = 'UTC';

      // act
      const actualResult = convertLocalTimeToUTC(givenIsoTime, givenTimeZone);

      // assert
      expect(actualResult.getUTCFullYear()).toBe(2025);
      expect(actualResult.getUTCMonth()).toBe(11);
      expect(actualResult.getUTCDate()).toBe(1);
      expect(actualResult.getUTCHours()).toBe(11);
    });

    it('should throw when given an invalid time zone input', () => {
      // arrange
      const givenDateString = '01.05.2025 11:00';
      const givenInvalidTimeZone = 'invalid';

      // act & assert
      const actualOperation = () => convertLocalTimeToUTC(givenDateString, givenInvalidTimeZone);

      expect(actualOperation).toThrow();
    });
  });
});
