/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { CsvDocumentEntity, ReadByIdPayload, VerifyCsvDocumentIntegrityResultEntity } from '@h2-trust/amqp';
import { BlockchainService, HashUtil } from '@h2-trust/blockchain';
import { CsvImportRepository } from '@h2-trust/database';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { CentralizedStorageService, DecentralizedStorageService } from '@h2-trust/storage';

@Injectable()
export class CsvDocumentService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly centralizedStorageService: CentralizedStorageService,
    private readonly decentralizedStorageService: DecentralizedStorageService,
  ) { }

  async findByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.csvImportRepository.findAllCsvDocumentsByCompanyId(payload.id);
  }

  async verifyCsvDocumentIntegrity(payload: ReadByIdPayload): Promise<VerifyCsvDocumentIntegrityResultEntity> {
    const csvDocument = await this.csvImportRepository.findCsvDocumentById(payload.id);

    if (!csvDocument) {
      const message = `CsvDocument with id ${payload.id} does not exist, cannot verify file.`;
      return this.createFailedResult(payload.id, null, message, null);
    }

    if (!csvDocument.transactionHash) {
      const message = `CsvDocument with id ${csvDocument.id} has no transaction hash, cannot verify file.`;
      return this.createFailedResult(csvDocument.id, csvDocument.fileName, message, csvDocument.transactionHash);
    }

    if (!this.blockchainService.blockchainEnabled) {
      const message = 'Blockchain integration is disabled, cannot verify file integrity.';
      return this.createFailedResult(csvDocument.id, csvDocument.fileName, message, csvDocument.transactionHash);
    }

    try {
      const [fileStream, proof, blockchainMetadata] = await Promise.all([
        this.centralizedStorageService.downloadFile(csvDocument.fileName),
        this.blockchainService.retrieveProof(csvDocument.id),
        this.blockchainService.retrieveBlockchainMetadata(csvDocument.transactionHash),
      ]);

      if (!fileStream) {
        const message = `Csv file with name ${csvDocument.fileName} does not exist in storage, cannot verify file.`;
        return this.createFailedResult(csvDocument.id, csvDocument.fileName, message, csvDocument.transactionHash);
      }

      if (!proof) {
        const message = `No blockchain proof found for CsvDocument with id ${csvDocument.id}, cannot verify file.`;
        return this.createFailedResult(csvDocument.id, csvDocument.fileName, message, csvDocument.transactionHash);
      }

      if (!blockchainMetadata) {
        const message = `No blockchain metadata found for CsvDocument with id ${csvDocument.id}, cannot verify file.`;
        return this.createFailedResult(csvDocument.id, csvDocument.fileName, message, csvDocument.transactionHash);
      }

      const validHash = await HashUtil.verifyStreamWithStoredHash(fileStream, proof.hash);

      this.logger.debug(
        `${validHash ? '✅ Valid' : '❌ Invalid'} integrity for CsvDocument with id ${csvDocument.id} and file name ${csvDocument.fileName}`,
      );

      return this.createSuccessfulResult(
        csvDocument.id,
        csvDocument.fileName,
        validHash,
        csvDocument.transactionHash,
        blockchainMetadata.blockNumber,
        blockchainMetadata.blockTimestamp,
        proof.cid,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      const logMessage = `❌ Failed to verify integrity for CsvDocument with id ${csvDocument.id} and file name ${csvDocument.fileName}: ${errorMessage}`;
      this.logger.error(logMessage, error instanceof Error ? error.stack : undefined);

      const resultMessage = `Verification failed due to unexpected error: ${errorMessage}`;
      return this.createFailedResult(csvDocument.id, csvDocument.fileName, resultMessage, csvDocument.transactionHash);
    }
  }

  private createSuccessfulResult(
    documentId: string,
    fileName: string,
    validHash: boolean,
    transactionHash: string,
    blockNumber: number,
    blockTimestamp: Date,
    cid: string,
  ): VerifyCsvDocumentIntegrityResultEntity {
    const status = validHash ? CsvDocumentIntegrityStatus.VERIFIED : CsvDocumentIntegrityStatus.MISMATCH;
    const message = validHash
      ? 'The file matches the registered proof.'
      : 'The file does not match the registered proof.';

    return this.createResult(documentId, fileName, status, message, transactionHash, blockNumber, blockTimestamp, cid);
  }

  private createFailedResult(
    documentId: string,
    fileName: string | null,
    message: string,
    transactionHash: string | null,
  ): VerifyCsvDocumentIntegrityResultEntity {
    return this.createResult(
      documentId,
      fileName,
      CsvDocumentIntegrityStatus.FAILED,
      message,
      transactionHash,
      null,
      null,
      null,
    );
  }

  private createResult(
    documentId: string,
    fileName: string | null,
    status: CsvDocumentIntegrityStatus,
    message: string,
    transactionHash: string | null,
    blockNumber: number | null,
    blockTimestamp: Date | null,
    cid: string | null,
  ): VerifyCsvDocumentIntegrityResultEntity {
    const { blockchainEnabled } = this.blockchainService;
    const ipfsExplorerUrl = blockchainEnabled && cid ? `${this.decentralizedStorageService.explorerUrl}/${cid}` : null;
    const blockchainExplorerUrl = blockchainEnabled && transactionHash ? `${this.blockchainService.explorerUrl}/${transactionHash}` : null;
    const network = blockchainEnabled ? this.blockchainService.endpointUrl : null;
    const smartContractAddress = blockchainEnabled ? this.blockchainService.smartContractAddress : null;

    return new VerifyCsvDocumentIntegrityResultEntity(
      documentId,
      fileName,
      status,
      message,
      transactionHash,
      blockNumber,
      blockTimestamp,
      network,
      smartContractAddress,
      blockchainExplorerUrl,
      cid,
      ipfsExplorerUrl,
    );
  }
}
