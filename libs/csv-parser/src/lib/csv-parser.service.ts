/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { parse } from 'csv-parse';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AccountingPeriodHydrogen, AccountingPeriodPower, BrokerException } from '@h2-trust/amqp';

@Injectable()
export class CsvParserService {
  static readonly DATE_TIME_REGEX = /^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}(:\d{2})?$/;

  private readonly logger: Logger = new Logger(CsvParserService.name);

  async parseFile<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    file: Express.Multer.File,
    columns: string[],
  ): Promise<T[]> {
    if (file.size === 0) {
      throw new BrokerException(`${file.originalname} is empty`, HttpStatus.BAD_REQUEST);
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BrokerException(
        `Invalid file type: expected .csv but got: ${file.originalname}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const buffer = file.buffer.toString();

    const firstLine = buffer
      .split('\n')[0]
      .split(',')
      .map((h) => h.trim());
    for (const column of columns) {
      if (!firstLine.includes(column)) {
        throw new BrokerException(`Missing required column: ${column}`, HttpStatus.BAD_REQUEST);
      }
    }

    const records: T[] = await this.parseBuffer<T>(buffer, columns);
    return records.filter((row) => Object.values(row).every((val) => val !== null));
  }

  private async parseBuffer<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    buffer: string,
    columns: string[],
  ): Promise<T[]> {
    let skipped = 0;
    let invalid = 0;
    return new Promise<T[]>((resolve, reject) => {
      parse<T>(
        buffer,
        {
          columns: columns,
          from_line: 2,
          delimiter: ',',
          relax_column_count: true,
          skip_empty_lines: true,
          skip_records_with_error: true,
          cast: (value, context) => {
            if (context.column === 'time') {
              let date: Date | null = null;

              if (CsvParserService.DATE_TIME_REGEX.test(value)) {
                const [datePart, timePart] = value.split(/\s+/);
                const [day, month, year] = datePart.split('.').map(Number);
                const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
                return new Date(year, month - 1, day, hours, minutes, seconds);
              } else if (!isNaN(Date.parse(value))) {
                date = new Date(value);
              } else if (!isNaN(Number(value))) {
                const num = Number(value);
                date = new Date((num - 25569) * 86400 * 1000);
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
        },
        (err, records) => {
          if (err) {
            this.logger.error('CSV parse error:', err.message);
            return reject(err);
          }
          this.logger.log('Parsed records:', records.length);
          this.logger.log('skipped records:', skipped);
          this.logger.log('Invalid records:', invalid);

          resolve(records);
        },
      );
    });
  }
}
