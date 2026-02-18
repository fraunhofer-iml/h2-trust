/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { CsvDocumentEntity, ProofEntity, ReadByIdPayload } from '@h2-trust/amqp';
import { BlockchainService, HashUtil } from '@h2-trust/blockchain';
import { CsvImportRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { CsvDocumentService } from './csv-document.service';
import { BatchType } from '@h2-trust/domain';

describe('CsvDocumentService', () => {
  let service: CsvDocumentService;

  const csvImportRepositoryMock = {
    findAllCsvDocumentsByCompanyId: jest.fn(),
    findCsvDocumentById: jest.fn(),
  };

  const storageServiceMock = {
    fileExists: jest.fn(),
    downloadFile: jest.fn(),
  };

  const blockchainServiceMock = {
      blockchainEnabled: true,
    retrieveProof: jest.fn(),
  };

  beforeEach(async () => {
      blockchainServiceMock.blockchainEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvDocumentService,
        {
          provide: CsvImportRepository,
          useValue: csvImportRepositoryMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: BlockchainService,
          useValue: blockchainServiceMock,
        },
      ],
    }).compile();

    service = module.get<CsvDocumentService>(CsvDocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('findByCompany', () => {
    it('returns all csv documents for a company', async () => {
      // Arrange
      const givenCompanyId = 'company-1';
      const givenPayload = new ReadByIdPayload(givenCompanyId);
      const givenDocuments = [
        new CsvDocumentEntity('doc-1', 'file-1.csv', BatchType.POWER, new Date(), new Date(), 10),
        new CsvDocumentEntity('doc-2', 'file-2.csv', BatchType.HYDROGEN, new Date(), new Date(), 5),
      ];

      csvImportRepositoryMock.findAllCsvDocumentsByCompanyId.mockResolvedValue(givenDocuments);

      // Act
      const actualResult = await service.findByCompany(givenPayload);

      // Assert
      expect(csvImportRepositoryMock.findAllCsvDocumentsByCompanyId).toHaveBeenCalledWith(givenCompanyId);
      expect(actualResult).toEqual(givenDocuments);
    });
  });

  describe('verifyCsvDocumentIntegrity', () => {
    it('returns true when file exists and hash verification succeeds', async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-1');
      const givenDocument = new CsvDocumentEntity(
        givenPayload.id,
        'production.csv',
        BatchType.POWER,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:15:00.000Z'),
        42,
        'tx-hash',
      );
      const givenFileStream = Readable.from(['csv-content']);
      const givenProof = new ProofEntity(givenDocument.id, 'stored-hash', 'cid-1');

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      storageServiceMock.fileExists.mockResolvedValue(true);
      storageServiceMock.downloadFile.mockResolvedValue(givenFileStream);
      blockchainServiceMock.retrieveProof.mockResolvedValue(givenProof);
      jest.spyOn(HashUtil, 'verifyStreamWithStoredHash').mockResolvedValue(true);

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.fileExists).toHaveBeenCalledWith(givenDocument.fileName);
      expect(storageServiceMock.downloadFile).toHaveBeenCalledWith(givenDocument.fileName);
      expect(blockchainServiceMock.retrieveProof).toHaveBeenCalledWith(givenDocument.id);
      expect(HashUtil.verifyStreamWithStoredHash).toHaveBeenCalledWith(givenFileStream, givenProof.hash);
      expect(actualResult).toBe(true);
    });

    it('returns false when hash verification fails', async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-2');
      const givenDocument = new CsvDocumentEntity(
        givenPayload.id,
        'hydrogen.csv',
        BatchType.HYDROGEN,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:15:00.000Z'),
        7,
        'tx-hash-2',
      );
      const givenFileStream = Readable.from(['csv-content']);
      const givenProof = new ProofEntity(givenDocument.id, 'stored-hash-2', 'cid-2');

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      storageServiceMock.fileExists.mockResolvedValue(true);
      storageServiceMock.downloadFile.mockResolvedValue(givenFileStream);
      blockchainServiceMock.retrieveProof.mockResolvedValue(givenProof);
      jest.spyOn(HashUtil, 'verifyStreamWithStoredHash').mockResolvedValue(false);

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult).toBe(false);
    });

      it('throws when blockchain integration is disabled', async () => {
          // Arrange
          const givenPayload = new ReadByIdPayload('doc-1');
          blockchainServiceMock.blockchainEnabled = false;

          // Act / Assert
          await expect(service.verifyCsvDocumentIntegrity(givenPayload)).rejects.toThrow(
              'Blockchain integration is disabled, cannot verify file integrity.',
          );

          expect(csvImportRepositoryMock.findCsvDocumentById).not.toHaveBeenCalled();
          expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
          expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
          expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      });

    it('throws when document does not exist', async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('missing-document-id');
      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(null);

      // Act / Assert
      await expect(service.verifyCsvDocumentIntegrity(givenPayload)).rejects.toThrow(
        `Document with id ${givenPayload.id} does not exist, cannot verify file.`,
      );

      expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
    });

    it('throws when document has no transaction hash', async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-without-hash');
      const givenDocument = new CsvDocumentEntity(
        givenPayload.id,
        'production.csv',
        BatchType.POWER,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:15:00.000Z'),
        1,
      );

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);

      // Act / Assert
      await expect(service.verifyCsvDocumentIntegrity(givenPayload)).rejects.toThrow(
        `Document with id ${givenPayload.id} has no transaction hash, cannot verify file.`,
      );

      expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
    });

    it('throws when file does not exist in storage', async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-3');
      const givenDocument = new CsvDocumentEntity(
        givenPayload.id,
        'missing-file.csv',
        BatchType.POWER,
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:15:00.000Z'),
        3,
        'tx-hash-3',
      );

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      storageServiceMock.fileExists.mockResolvedValue(false);

      // Act / Assert
      await expect(service.verifyCsvDocumentIntegrity(givenPayload)).rejects.toThrow(
        `File with name ${givenDocument.fileName} does not exist, cannot verify file.`,
      );

      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
    });
  });
});
