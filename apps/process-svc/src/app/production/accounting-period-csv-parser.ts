/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { parse } from 'csv-parse';
import { HttpStatus, Logger } from '@nestjs/common';
import { AccountingPeriodHydrogen, AccountingPeriodPower, BrokerException } from '@h2-trust/amqp';
import { DateTimeUtil } from '@h2-trust/utils';

export class AccountingPeriodCsvParser {
  private static readonly logger: Logger = new Logger(AccountingPeriodCsvParser.name);
  private static readonly dateTimeRegex = /^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}(:\d{2})?$/;

  static async parseStream<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    stream: NodeJS.ReadableStream,
    columns: string[],
    fileName: string,
  ): Promise<T[]> {
    if (!fileName.toLowerCase().endsWith('.csv')) {
      throw new BrokerException(`Invalid file type: expected .csv but got: ${fileName}`, HttpStatus.BAD_REQUEST);
    }

    let skipped = 0;
    let invalid = 0;

    const parser = parse<T>({
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

          if (AccountingPeriodCsvParser.dateTimeRegex.test(value)) {
            const [datePart, timePart] = value.split(/\s+/);
            const [day, month, year] = datePart.split('.').map(Number);
            const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
            return DateTimeUtil.toGermanDate(new Date(year, month - 1, day, hours, minutes, seconds));
          } else if (!isNaN(Date.parse(value))) {
            date = DateTimeUtil.toGermanDate(new Date(value));
          } else if (!isNaN(Number(value))) {
            const num = Number(value);
            date = DateTimeUtil.toGermanDate(new Date((num - 25569) * 86400 * 1000));
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

    return new Promise<T[]>((resolve, reject) => {
      const records: T[] = [];

      parser.on('readable', () => {
        let record: T | null;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', (err) => {
        this.logger.error('CSV parse error:', err.message);
        reject(err);
      });

      parser.on('end', () => {
        this.logger.log('Parsed records:', records.length);
        this.logger.log('skipped records:', skipped);
        this.logger.log('Invalid records:', invalid);
        resolve(records.filter((row) => Object.values(row).every((val) => val !== null)));
      });

      stream.pipe(parser);
    });
  }
}
