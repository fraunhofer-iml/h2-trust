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
import { BatchType, CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { CsvDocumentService } from './csv-document.service';

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
    enabled: true,
    rpcUrl: 'https://blockchain.io/rpc',
    smartContractAddress: '0xFbf708eE4a5887E96Faea1DDFA6cF6C828695223',
    explorerUrl: 'https://blockchain.io/tx',
    retrieveProof: jest.fn(),
    retrieveBlockchainMetadata: jest.fn(),
  };

  beforeEach(async () => {
    blockchainServiceMock.enabled = true;

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
    it(`returns ${CsvDocumentIntegrityStatus.VERIFIED} when file exists and hash verification succeeds`, async () => {
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
      blockchainServiceMock.retrieveBlockchainMetadata.mockResolvedValue({
        blockNumber: 123,
        blockTimestamp: new Date('2026-01-01T00:15:00.000Z'),
      });
      jest.spyOn(HashUtil, 'verifyStreamWithStoredHash').mockResolvedValue(true);

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.fileExists).toHaveBeenCalledWith(givenDocument.fileName);
      expect(storageServiceMock.downloadFile).toHaveBeenCalledWith(givenDocument.fileName);
      expect(blockchainServiceMock.retrieveProof).toHaveBeenCalledWith(givenDocument.id);
      expect(blockchainServiceMock.retrieveBlockchainMetadata).toHaveBeenCalledWith(givenDocument.transactionHash);
      expect(HashUtil.verifyStreamWithStoredHash).toHaveBeenCalledWith(givenFileStream, givenProof.hash);
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.VERIFIED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.blockNumber).toBe(123);
      expect(actualResult.blockTimestamp).toEqual(new Date('2026-01-01T00:15:00.000Z'));
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`);
      expect(actualResult.message).toContain('verified successfully');
    });

    it(`returns ${CsvDocumentIntegrityStatus.MISMATCH} when hash verification fails`, async () => {
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
      blockchainServiceMock.retrieveBlockchainMetadata.mockResolvedValue({
        blockNumber: 456,
        blockTimestamp: new Date('2026-01-01T00:15:00.000Z'),
      });
      jest.spyOn(HashUtil, 'verifyStreamWithStoredHash').mockResolvedValue(false);

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.MISMATCH);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.blockNumber).toBe(456);
      expect(actualResult.blockTimestamp).toEqual(new Date('2026-01-01T00:15:00.000Z'));
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`);
      expect(actualResult.message).toContain('mismatch');
      expect(blockchainServiceMock.retrieveBlockchainMetadata).toHaveBeenCalledWith(givenDocument.transactionHash);
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when blockchain integration is disabled`, async () => {
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

      blockchainServiceMock.enabled = false;
      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.message).toContain('Blockchain integration is disabled');
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`);
      expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveBlockchainMetadata).not.toHaveBeenCalled();
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when document does not exist`, async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('missing-document-id');
      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(null);
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenPayload.id);
      expect(actualResult.fileName).toBeNull();
      expect(actualResult.transactionHash).toBeNull();
      expect(actualResult.message).toContain(`Document with id ${givenPayload.id} does not exist`);
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/null`);

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveBlockchainMetadata).not.toHaveBeenCalled();
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when document has no transaction hash`, async () => {
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
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBeUndefined();
      expect(actualResult.message).toContain(`Document with id ${givenPayload.id} has no transaction hash`);
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/undefined`);

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.fileExists).not.toHaveBeenCalled();
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveBlockchainMetadata).not.toHaveBeenCalled();
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when file does not exist in storage`, async () => {
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
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.message).toContain(`File with name ${givenDocument.fileName} does not exist`);
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBe(blockchainServiceMock.rpcUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.explorerUrl).toBe(`${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`);

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveBlockchainMetadata).not.toHaveBeenCalled();
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });
  });
});
