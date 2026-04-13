/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  UnitAccountingPeriods,
  UnitFileImport,
} from '@h2-trust/amqp';
import { HashUtil } from '@h2-trust/blockchain';
import { CreateCsvDocumentInput } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { CentralizedStorageService, CONTENT_TYPES, DecentralizedStorageService } from '@h2-trust/storage';
import { AccountingPeriodCsvParser } from './accounting-period-csv-parser';
import { ParsedImport } from './production.types';

@Injectable()
export class CsvImportProcessingService {
  private static readonly validHeaders: Record<Exclude<BatchType, BatchType.WATER>, string[]> = {
    POWER: ['time', 'amount'],
    HYDROGEN: ['time', 'amount', 'power'],
  };

  constructor(
    private readonly centralizedStorageService: CentralizedStorageService,
    private readonly decentralizedStorageService: DecentralizedStorageService
  ) { }

  async parseAndUploadFiles<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    unitFileImports: UnitFileImport[],
    type: Exclude<BatchType, BatchType.WATER>,
  ): Promise<ParsedImport<T>[]> {
    const headers = CsvImportProcessingService.validHeaders[type];

    return Promise.all(
      unitFileImports.map(async (ufi) => {
        const buffer = Buffer.from(ufi.encodedFileBuffer, 'base64');
        const computedHash = HashUtil.hashBuffer(buffer);
        const expectedHash = ufi.hashedFileBuffer;

        if (computedHash !== expectedHash) {
          throw new Error(`File integrity check failed for unit ${ufi.unitId}: expected hash ${expectedHash} but computed ${computedHash}`);
        }

        const accountingPeriods = await AccountingPeriodCsvParser.parseBuffer<T>(buffer, headers);

        if (!accountingPeriods.length) {
          throw new Error(`${type} production file does not contain any valid items.`);
        }

        const fileName = `${expectedHash}.csv`;
        await this.centralizedStorageService.uploadFile(fileName, buffer, CONTENT_TYPES.CSV);
        const cid = await this.decentralizedStorageService.uploadFile(fileName, buffer, CONTENT_TYPES.CSV);

        return {
          periods: new UnitAccountingPeriods<T>(ufi.unitId, accountingPeriods),
          type,
          fileName,
          hash: expectedHash,
          cid,
        };
      }),
    );
  }

  createCsvDocumentInputs<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    parsedImports: ParsedImport<T>[],
  ): CreateCsvDocumentInput[] {
    return parsedImports.map((production) => {
      const { startedAt, endedAt, amount } = production.periods.accountingPeriods.reduce(
        (acc, accountingPeriod) => {
          const time = accountingPeriod.time.getTime();
          const amount = accountingPeriod.amount;

          return {
            startedAt: Math.min(acc.startedAt, time),
            endedAt: Math.max(acc.endedAt, time),
            amount: acc.amount + amount,
          };
        },
        { startedAt: Infinity, endedAt: -Infinity, amount: 0 },
      );

      return {
        type: production.type,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        fileName: production.fileName,
        amount,
      };
    });
  }
}
