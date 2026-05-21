/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseAccountingPeriodCsvBuffer } from './accounting-period-csv-parser';

describe('parseAccountingPeriodCsvBuffer', () => {
  describe('parseBuffer', () => {
    it('should parse localized datetime values when amount and power columns are present', async () => {
    // arrange
      const givenBuffer = Buffer.from('time,amount,power\n01.02.2026 13:45,12.5,33');

      // act
      const actualResult = await parseAccountingPeriodCsvBuffer(givenBuffer, ['time', 'amount', 'power'], 'UTC');

      // assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].amount).toBe(12.5);
      expect(actualResult[0].power).toBe(33);
      expect(actualResult[0].time.getUTCFullYear()).toEqual(2026);
      expect(actualResult[0].time.getUTCMonth()).toEqual(1);
      expect(actualResult[0].time.getUTCDate()).toEqual(1);
      expect(actualResult[0].time.getUTCHours()).toEqual(13);
      expect(actualResult[0].time.getUTCMinutes()).toEqual(45);
    });

    it('should parse ISO timestamps and Excel serial dates when valid rows are provided', async () => {
    // arrange
      const givenBuffer = Buffer.from('time,amount\n2026-01-01T10:00:00Z,5\n25569.25,7');

      // act
      const actualResult = await parseAccountingPeriodCsvBuffer(givenBuffer, ['time', 'amount'], 'UTC');

      // assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult[0].time.toISOString()).toBe('2026-01-01T10:00:00.000Z');
      expect(actualResult[1].time.toISOString()).toBe('1970-01-01T06:00:00.000Z');
      expect(actualResult[1].amount).toBe(7);
    });

    it('should throw an exception when a required column is missing', async () => {
    // arrange
      const givenBuffer = Buffer.from('time,amount\n2026-01-01T10:00:00Z,5');

      // act & assert
      const actualResult = 
        parseAccountingPeriodCsvBuffer(givenBuffer, ['time', 'amount', 'power'], 'Europe/Berlin'),
      ;

      await expect(actualResult).rejects.toMatchObject({
        message: 'Missing required column: power',
      });
    });

    it('should filter out rows when values are invalid or skipped', async () => {
    // arrange
      const givenBuffer = Buffer.from(
        'time,amount,power\ninvalid-date,10,5\n2026-01-01T00:00:00Z,0,5\n2026-01-01T01:00:00Z,10,invalid\n2026-01-01T02:00:00Z,12,6',
      );

      // act
      const actualResult = await parseAccountingPeriodCsvBuffer(givenBuffer, ['time', 'amount', 'power'], 'UTC');

      // assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].time.toISOString()).toBe('2026-01-01T02:00:00.000Z');
      expect(actualResult[0].amount).toBe(12);
      expect(actualResult[0].power).toBe(6);
    });
  });
});
