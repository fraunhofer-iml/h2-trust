/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { parse } from 'csv-parse';
import { Injectable, Logger } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  ParsedFileBundles,
  UnitDataBundle,
  UnitFileBundle,
} from '@h2-trust/amqp';

@Injectable()
export class CsvParserService {
  private readonly logger: Logger = new Logger(CsvParserService.name);

  async processFiles(powerProduction: UnitFileBundle[], hydrogenProduction: UnitFileBundle[]) {
    const parsedPowerFiles = await Promise.all(
      powerProduction.map(async (bundle) => {
        const parsedFile: AccountingPeriodPower[] = await this.parse<AccountingPeriodPower>(bundle.file);
        return new UnitDataBundle<AccountingPeriodPower>(bundle.unitId, parsedFile);
      }),
    );

    const parsedHydrogenFiles = await Promise.all(
      hydrogenProduction.map(async (bundle) => {
        const parsedFile: AccountingPeriodHydrogen[] = await this.parse<AccountingPeriodHydrogen>(bundle.file);
        return new UnitDataBundle<AccountingPeriodHydrogen>(bundle.unitId, parsedFile);
      }),
    );
    return new ParsedFileBundles(parsedPowerFiles, parsedHydrogenFiles);
  }

  async parse<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(file: Express.Multer.File): Promise<T[]> {
    const buffer = file.buffer.toString();
    const records: T[] = await this.parseFile<T>(buffer);
    return records.filter((row) => Object.values(row).every((val) => val !== null));
  }

  async parseFile<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(buffer: string): Promise<T[]> {
    let skipped = 0;
    let invalid = 0;
    return new Promise<T[]>((resolve, reject) => {
      parse<T>(
        buffer,
        {
          columns: true,
          delimiter: ',',
          relax_column_count: true,
          skip_empty_lines: true,
          skip_records_with_error: true,
          cast: (value, context) => {
            if (context.column === 'time') {
              let date: Date | null = null;

              if (!isNaN(Date.parse(value))) {
                date = new Date(value);
              } else if (!isNaN(Number(value))) {
                const num = Number(value);
                date = new Date((num - 25569) * 86400 * 1000);
              } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
                const [day, month, year] = value.split('.').map(Number);
                date = new Date(year, month - 1, day);
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
              if (num === 0) {
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
