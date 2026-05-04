/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/messaging';
import { parseAccountingPeriodCsvBuffer } from './accounting-period-csv-parser';

describe('parseAccountingPeriodCsvBuffer', () => {
  describe('parseBuffer', () => {
    it('parses localized datetime values with amount and power columns', async () => {
      const buffer = Buffer.from('time,amount,power\n01.02.2026 13:45,12.5,33');

      const actualResult = await parseAccountingPeriodCsvBuffer(buffer, ['time', 'amount', 'power']);

      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].amount).toBe(12.5);
      expect(actualResult[0].power).toBe(33);
      expect(actualResult[0].time).toEqual(new Date(2026, 1, 1, 13, 45));
    });

    it('parses ISO timestamps and Excel serial dates', async () => {
      const buffer = Buffer.from('time,amount\n2026-01-01T10:00:00Z,5\n25569.25,7');

      const actualResult = await parseAccountingPeriodCsvBuffer(buffer, ['time', 'amount']);

      expect(actualResult).toHaveLength(2);
      expect(actualResult[0].time.toISOString()).toBe('2026-01-01T10:00:00.000Z');
      expect(actualResult[1].time.toISOString()).toBe('1970-01-01T06:00:00.000Z');
      expect(actualResult[1].amount).toBe(7);
    });

    it('throws a broker exception when a required column is missing', async () => {
      const buffer = Buffer.from('time,amount\n2026-01-01T10:00:00Z,5');

      await expect(parseAccountingPeriodCsvBuffer(buffer, ['time', 'amount', 'power'])).rejects.toMatchObject({
        message: 'Missing required column: power',
        error: {
          status: HttpStatus.BAD_REQUEST,
        },
      });
    });

    it('filters out rows with invalid or skipped values', async () => {
      const buffer = Buffer.from(
        'time,amount,power\ninvalid-date,10,5\n2026-01-01T00:00:00Z,0,5\n2026-01-01T01:00:00Z,10,invalid\n2026-01-01T02:00:00Z,12,6',
      );

      const actualResult = await parseAccountingPeriodCsvBuffer(buffer, ['time', 'amount', 'power']);

      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].time.toISOString()).toBe('2026-01-01T02:00:00.000Z');
      expect(actualResult[0].amount).toBe(12);
      expect(actualResult[0].power).toBe(6);
    });
  });
});