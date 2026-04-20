/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService, HashUtil } from '@h2-trust/blockchain';
import { FeatureFlagService } from '@h2-trust/configuration';
import { CsvDocumentEntity, ProofEntity, ReadByIdPayload } from '@h2-trust/contracts';
import { CsvDocumentEntityFixture, ProofEntityFixture } from '@h2-trust/contracts/testing';
import { CsvImportRepository } from '@h2-trust/database';
import { BatchType, CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { CentralizedStorageService, DecentralizedStorageService } from '@h2-trust/storage';
import { CsvDocumentService } from './csv-document.service';

describe('CsvDocumentService', () => {
  let service: CsvDocumentService;

  const csvImportRepositoryMock = {
    findAllCsvDocumentsByCompanyId: jest.fn(),
    findCsvDocumentById: jest.fn(),
  };

  const storageServiceMock = {
    downloadFile: jest.fn(),
  };

  const blockchainServiceMock = {
    endpointUrl: 'https://blockchain.io/rpc',
    smartContractAddress: '0xFbf708eE4a5887E96Faea1DDFA6cF6C828695223',
    explorerUrl: 'https://blockchain.io/tx',
    retrieveProof: jest.fn(),
    retrieveBlockchainMetadata: jest.fn(),
  };

  const featureFlagServiceMock = {
    verificationEnabled: true,
  };

  beforeEach(async () => {
    featureFlagServiceMock.verificationEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvDocumentService,
        {
          provide: CsvImportRepository,
          useValue: csvImportRepositoryMock,
        },
        {
          provide: CentralizedStorageService,
          useValue: storageServiceMock,
        },
        {
          provide: DecentralizedStorageService,
          useValue: storageServiceMock,
        },
        {
          provide: BlockchainService,
          useValue: blockchainServiceMock,
        },
        {
          provide: FeatureFlagService,
          useValue: featureFlagServiceMock,
        },
      ],
    }).compile();

    service = module.get<CsvDocumentService>(CsvDocumentService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('findByCompany', () => {
    it('returns all csv documents for a company', async () => {
      // Arrange
      const givenCompanyId = 'company-1';
      const givenPayload = new ReadByIdPayload(givenCompanyId);
      const givenDocuments = [
        CsvDocumentEntityFixture.create({
          id: 'doc-1',
          fileName: 'file-1.csv',
          type: BatchType.POWER,
          startedAt: new Date(),
          endedAt: new Date(),
          amount: 10,
        }),
        CsvDocumentEntityFixture.create({
          id: 'doc-2',
          fileName: 'file-2.csv',
          type: BatchType.HYDROGEN,
          startedAt: new Date(),
          endedAt: new Date(),
          amount: 5,
        }),
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
      const givenDocument = CsvDocumentEntityFixture.create({
        id: givenPayload.id,
        fileName: 'production.csv',
        type: BatchType.POWER,
        amount: 42,
        transactionHash: 'tx-hash',
      });

      const givenFileStream = Readable.from(['csv-content']);
      const givenProof = ProofEntityFixture.create({
        uuid: givenDocument.id,
        hash: 'stored-hash',
        cid: 'cid-1',
      });

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
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
      expect(actualResult.network).toBe(blockchainServiceMock.endpointUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.blockchainExplorerUrl).toBe(
        `${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`,
      );
      expect(actualResult.message).toContain('The file matches the registered proof.');
    });

    it(`returns ${CsvDocumentIntegrityStatus.MISMATCH} when hash verification fails`, async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-2');
      const givenDocument = CsvDocumentEntityFixture.create({
        id: givenPayload.id,
        fileName: 'hydrogen.csv',
        type: BatchType.HYDROGEN,
        amount: 7,
        transactionHash: 'tx-hash-2',
      });

      const givenFileStream = Readable.from(['csv-content']);
      const givenProof = ProofEntityFixture.create({
        uuid: givenDocument.id,
        hash: 'stored-hash-2',
        cid: 'cid-2',
      });

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
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
      expect(actualResult.network).toBe(blockchainServiceMock.endpointUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.blockchainExplorerUrl).toBe(
        `${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`,
      );
      expect(actualResult.message).toContain('The file does not match the registered proof.');
      expect(blockchainServiceMock.retrieveBlockchainMetadata).toHaveBeenCalledWith(givenDocument.transactionHash);
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when blockchain integration is disabled`, async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-1');
      const givenDocument = CsvDocumentEntityFixture.create({
        id: givenPayload.id,
        fileName: 'production.csv',
        type: BatchType.POWER,
        amount: 42,
        transactionHash: 'tx-hash',
      });

      featureFlagServiceMock.verificationEnabled = false;
      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.message).toContain('Blockchain integration disabled, cannot verify file integrity.');
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBeNull();
      expect(actualResult.smartContractAddress).toBeNull();
      expect(actualResult.blockchainExplorerUrl).toBeNull();
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
      expect(actualResult.network).toBe(blockchainServiceMock.endpointUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.blockchainExplorerUrl).toBeNull();

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
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
        new Date(),
        new Date(),
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
      expect(actualResult.network).toBe(blockchainServiceMock.endpointUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.blockchainExplorerUrl).toBeNull();

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.downloadFile).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveProof).not.toHaveBeenCalled();
      expect(blockchainServiceMock.retrieveBlockchainMetadata).not.toHaveBeenCalled();
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });

    it(`returns ${CsvDocumentIntegrityStatus.FAILED} when file does not exist in storage`, async () => {
      // Arrange
      const givenPayload = new ReadByIdPayload('doc-3');
      const givenDocument = CsvDocumentEntityFixture.create({
        id: givenPayload.id,
        fileName: 'missing-file.csv',
        type: BatchType.POWER,
        amount: 3,
        transactionHash: 'tx-hash-3',
      });

      csvImportRepositoryMock.findCsvDocumentById.mockResolvedValue(givenDocument);
      storageServiceMock.downloadFile.mockResolvedValue(null);
      blockchainServiceMock.retrieveProof.mockResolvedValue(new ProofEntity(givenDocument.id, 'hash-3', 'cid-3'));
      blockchainServiceMock.retrieveBlockchainMetadata.mockResolvedValue({
        blockNumber: 789,
        blockTimestamp: new Date('2026-01-01T00:15:00.000Z'),
      });
      const hashVerifySpy = jest.spyOn(HashUtil, 'verifyStreamWithStoredHash');

      // Act
      const actualResult = await service.verifyCsvDocumentIntegrity(givenPayload);

      // Assert
      expect(actualResult.status).toBe(CsvDocumentIntegrityStatus.FAILED);
      expect(actualResult.documentId).toBe(givenDocument.id);
      expect(actualResult.fileName).toBe(givenDocument.fileName);
      expect(actualResult.transactionHash).toBe(givenDocument.transactionHash);
      expect(actualResult.message).toContain(
        `Csv file with name ${givenDocument.fileName} does not exist in storage, cannot verify file.`,
      );
      expect(actualResult.blockNumber).toBeNull();
      expect(actualResult.blockTimestamp).toBeNull();
      expect(actualResult.network).toBe(blockchainServiceMock.endpointUrl);
      expect(actualResult.smartContractAddress).toBe(blockchainServiceMock.smartContractAddress);
      expect(actualResult.blockchainExplorerUrl).toBe(
        `${blockchainServiceMock.explorerUrl}/${givenDocument.transactionHash}`,
      );

      expect(csvImportRepositoryMock.findCsvDocumentById).toHaveBeenCalledWith(givenPayload.id);
      expect(storageServiceMock.downloadFile).toHaveBeenCalledWith(givenDocument.fileName);
      expect(blockchainServiceMock.retrieveProof).toHaveBeenCalledWith(givenDocument.id);
      expect(blockchainServiceMock.retrieveBlockchainMetadata).toHaveBeenCalledWith(givenDocument.transactionHash);
      expect(hashVerifySpy).not.toHaveBeenCalled();
    });
  });
});
