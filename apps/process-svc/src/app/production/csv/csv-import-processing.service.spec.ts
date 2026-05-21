/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hashBuffer } from '@h2-trust/blockchain';
import {
  StagedProductionAccountingPeriod,
  UnitAccountingPeriods,
  UnitFileImport,
} from '@h2-trust/contracts/entities';
import { CsvContentType } from '@h2-trust/domain';
import { ContentType, CentralizedStorageService, DecentralizedStorageService } from '@h2-trust/storage';
import { ParsedImport } from '../production.types';
import { parseAccountingPeriodCsvBuffer } from './accounting-period-csv-parser';
import { CsvImportProcessingService } from './csv-import-processing.service';

jest.mock('@h2-trust/blockchain', () => ({
  ...jest.requireActual('@h2-trust/blockchain'),
  hashBuffer: jest.fn(),
}));

jest.mock('./accounting-period-csv-parser', () => ({
  parseAccountingPeriodCsvBuffer: jest.fn(),
}));

describe('CsvImportProcessingService', () => {
  let service: CsvImportProcessingService;

  const hashBufferMock = jest.mocked(hashBuffer);
  const parseAccountingPeriodCsvBufferMock = jest.mocked(parseAccountingPeriodCsvBuffer);

  const centralizedStorageServiceMock = {
    uploadFile: jest.fn(),
  };

  const decentralizedStorageServiceMock = {
    uploadFile: jest.fn(),
  };

  const createService = async (withDecentralizedStorage = true): Promise<CsvImportProcessingService> => {
    const providers: Provider[] = [
      CsvImportProcessingService,
      {
        provide: CentralizedStorageService,
        useValue: centralizedStorageServiceMock,
      },
    ];

    if (withDecentralizedStorage) {
      providers.push({
        provide: DecentralizedStorageService,
        useValue: decentralizedStorageServiceMock,
      });
    }

    const module: TestingModule = await Test.createTestingModule({
      providers,
    }).compile();

    return module.get<CsvImportProcessingService>(CsvImportProcessingService);
  };

  beforeEach(async () => {
    service = await createService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAndUploadFiles', () => {
    it('should parse files, upload them to both storages, and return proof metadata when called', async () => {
      // arrange
      const givenBuffer = Buffer.from('time,amount\n2026-01-01T00:00:00Z,12');
      const givenImport = new UnitFileImport('unit-1', 'expected-hash', givenBuffer.toString('base64'), CsvContentType.POWER);
      const givenAccountingPeriods = [
        new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 0),
      ];

      hashBufferMock.mockReturnValue('expected-hash');
      parseAccountingPeriodCsvBufferMock.mockResolvedValue(givenAccountingPeriods);
      decentralizedStorageServiceMock.uploadFile.mockResolvedValue('cid-1');

      // act
      const actualResult = await service.parseAndUploadFiles([givenImport], 'Europe/Berlin');

      // assert
      expect(parseAccountingPeriodCsvBufferMock).toHaveBeenCalledWith(
        givenBuffer,
        ['time', 'amount'],
        'Europe/Berlin',
      );
      expect(centralizedStorageServiceMock.uploadFile).toHaveBeenCalledWith(
        'expected-hash.csv',
        givenBuffer,
        ContentType.CSV,
      );
      expect(decentralizedStorageServiceMock.uploadFile).toHaveBeenCalledWith(
        'expected-hash.csv',
        givenBuffer,
        ContentType.CSV,
      );
      expect(actualResult).toEqual([
        {
          periods: new UnitAccountingPeriods('unit-1', givenAccountingPeriods),
          type: CsvContentType.POWER,
          fileName: 'expected-hash.csv',
          hash: 'expected-hash',
          cid: 'cid-1',
        },
      ]);
    });

    it('should throw when the computed file hash does not match the expected hash', async () => {
      // arrange
      const givenImport = new UnitFileImport(
        'unit-1',
        'expected-hash',
        Buffer.from('csv').toString('base64'),
        CsvContentType.POWER,
      );

      hashBufferMock.mockReturnValue('different-hash');

      // act & assert
      const actualResult = service.parseAndUploadFiles([givenImport], 'Europe/Berlin');

      await expect(actualResult).rejects.toThrow(
        'File integrity check failed for unit unit-1: expected hash expected-hash but computed different-hash',
      );
      expect(centralizedStorageServiceMock.uploadFile).not.toHaveBeenCalled();
      expect(decentralizedStorageServiceMock.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw when the parsed CSV does not contain any valid accounting periods', async () => {
      // arrange
      const givenImport = new UnitFileImport(
        'unit-1',
        'expected-hash',
        Buffer.from('csv').toString('base64'),
        CsvContentType.HYDROGEN,
      );

      hashBufferMock.mockReturnValue('expected-hash');
      parseAccountingPeriodCsvBufferMock.mockResolvedValue([]);

      // act & assert
      const actualResult = service.parseAndUploadFiles([givenImport], 'Europe/Berlin');

      await expect(actualResult).rejects.toThrow(
        `${CsvContentType.HYDROGEN} production file does not contain any valid items.`,
      );
      expect(centralizedStorageServiceMock.uploadFile).not.toHaveBeenCalled();
      expect(decentralizedStorageServiceMock.uploadFile).not.toHaveBeenCalled();
    });

    it('should return a null CID when decentralized storage is not configured', async () => {
      // arrange
      service = await createService(false);

      const givenBuffer = Buffer.from('time,amount,power\n2026-01-01T00:00:00Z,12,5');
      const givenImport = new UnitFileImport('unit-1', 'expected-hash', givenBuffer.toString('base64'), CsvContentType.HYDROGEN);
      const givenAccountingPeriods = [
        new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 5),
      ];

      hashBufferMock.mockReturnValue('expected-hash');
      parseAccountingPeriodCsvBufferMock.mockResolvedValue(givenAccountingPeriods);

      // act
      const actualResult = await service.parseAndUploadFiles([givenImport], 'Europe/Berlin');

      // assert
      expect(actualResult[0].cid).toBeNull();
      expect(centralizedStorageServiceMock.uploadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCsvDocumentInputs', () => {
    it('should aggregate start, end, and amount for each parsed import when called', () => {
      // arrange
      const givenParsedImports: ParsedImport[] = [
        {
          periods: new UnitAccountingPeriods('unit-1', [
            new StagedProductionAccountingPeriod(4, new Date('2026-01-01T02:00:00Z'), 0),
            new StagedProductionAccountingPeriod(6, new Date('2026-01-01T01:00:00Z'), 0),
          ]),
          type: CsvContentType.POWER,
          fileName: 'hash-1.csv',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ];

      // act
      const actualResult = service.createCsvDocumentInputs(givenParsedImports);

      // assert
      expect(actualResult).toEqual([
        {
          type: CsvContentType.POWER,
          startedAt: new Date('2026-01-01T01:00:00Z'),
          endedAt: new Date('2026-01-01T02:00:00Z'),
          fileName: 'hash-1.csv',
          amount: 10,
        },
      ]);
    });

    it('should throw when called with an empty import list', () => {
      expect(() => service.createCsvDocumentInputs([])).toThrow(
        'createCsvDocumentInputs called with empty parsedImports',
      );
    });
  });
});