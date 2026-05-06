/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Logger } from '@nestjs/common';
import { parse } from 'csv-parse';
import { StagedProductionAccountingPeriod } from '@h2-trust/contracts/entities';
import { BrokerException } from '@h2-trust/messaging';
import { convertLocalTimeToUTC } from '@h2-trust/utils';

const logger: Logger = new Logger('AccountingPeriodCsvParser');
const dateTimeRegex = /^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}(:\d{2})?$/;

export async function parseAccountingPeriodCsvBuffer(
  buffer: Buffer,
  columns: string[],
  timeZone: string,
): Promise<StagedProductionAccountingPeriod[]> {
  let skipped = 0;
  let invalid = 0;

  const parser = parse({
    columns: (header) => {
      const normalizedColumns = header.map((h) => h.trim().replace(/^\uFEFF/, ''));
      for (const column of columns) {
        if (!normalizedColumns.includes(column)) {
          throw new BrokerException(`Missing required column: ${column}`, HttpStatus.BAD_REQUEST);
        }
      }
      return normalizedColumns;
    },
    delimiter: ',',
    relax_column_count: true,
    skip_empty_lines: true,
    skip_records_with_error: true,
    cast: (value, context) => {
      if (context.column === 'time') {
        let date: Date | null = null;

        if (dateTimeRegex.test(value) || !isNaN(Date.parse(value))) {
          return convertLocalTimeToUTC(value, timeZone);
        } else if (!isNaN(Number(value))) {
          const num = Number(value);
          date = convertLocalTimeToUTC((num - 25569) * 86400 * 1000, timeZone);
        }
        if (!date || isNaN(date.getTime())) {
          invalid++;
          return null;
        }
        return date;
      }

      if (context.column === 'amount' || context.column === 'power') {
        if (!value) return null;
        const num = Number(value);
        if (Number.isNaN(num)) {
          invalid++;
          return null;
        }
        if (num <= 0) {
          skipped++;
          return null;
        }
        return num;
      }
      return value;
    },
  });

  return new Promise((resolve, reject) => {
    const records: StagedProductionAccountingPeriod[] = [];

    parser.on('readable', () => {
      let record: StagedProductionAccountingPeriod | null;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', (err) => {
      logger.error('CSV parse error:', err.message);
      reject(err);
    });

    parser.on('end', () => {
      logger.debug(`Parsed records: ${records.length}`);
      logger.debug(`Skipped records: ${skipped}`);
      logger.debug(`Invalid records: ${invalid}`);
      resolve(records.filter((row) => Object.values(row).every((val) => val !== null)));
    });

    parser.write(buffer);
    parser.end();
  });
}
