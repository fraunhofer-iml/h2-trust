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
import { DecentralizedStorageService } from '@h2-trust/storage';

@Injectable()
export class CsvDocumentService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly storageService: DecentralizedStorageService,
  ) { }

  async findByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.csvImportRepository.findAllCsvDocumentsByCompanyId(payload.id);
  }

  async verifyCsvDocumentIntegrity(payload: ReadByIdPayload): Promise<VerifyCsvDocumentIntegrityResultEntity> {
    const document = await this.csvImportRepository.findCsvDocumentById(payload.id);

    if (!document) {
      const message = `Document with id ${payload.id} does not exist, cannot verify file.`;
      return this.createFailedResult(payload.id, null, message, null);
    }

    if (!document.transactionHash) {
      const message = `Document with id ${document.id} has no transaction hash, cannot verify file.`;
      return this.createFailedResult(document.id, document.fileHash, message, document.transactionHash);
    }

    if (!this.blockchainService.blockchainEnabled) {
      const message = 'Blockchain integration is disabled, cannot verify file integrity.';
      return this.createFailedResult(document.id, document.fileHash, message, document.transactionHash);
    }

    const fileName = `${document.fileHash}.csv`;

    try {
      const [fileStream, proof, blockchainMetadata] = await Promise.all([
        this.storageService.downloadCsvFile(fileName),
        this.blockchainService.retrieveProof(document.id),
        this.blockchainService.retrieveBlockchainMetadata(document.transactionHash),
      ]);

      if (!fileStream) {
        const message = `File with name ${fileName} does not exist in storage, cannot verify file.`;
        return this.createFailedResult(document.id, document.fileHash, message, document.transactionHash);
      }

      if (!proof) {
        const message = `No blockchain proof found for document with id ${document.id}, cannot verify file.`;
        return this.createFailedResult(document.id, document.fileHash, message, document.transactionHash);
      }

      if (!blockchainMetadata) {
        const message = `No blockchain metadata found for transaction hash ${document.transactionHash}, cannot verify file.`;
        return this.createFailedResult(document.id, document.fileHash, message, document.transactionHash);
      }

      const validHash = await HashUtil.verifyStreamWithStoredHash(fileStream, proof.hash);

      this.logger.debug(
        `${validHash ? '✅ Valid' : '❌ Invalid'} integrity for document with id ${document.id} and file name ${fileName}`,
      );

      return this.createSuccessfulResult(
        document.id,
        document.fileHash,
        validHash,
        document.transactionHash,
        blockchainMetadata.blockNumber,
        blockchainMetadata.blockTimestamp,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      const logMessage = `❌ Failed to verify integrity for document with id ${document.id} and file name ${fileName}: ${errorMessage}`;
      this.logger.error(logMessage, error instanceof Error ? error.stack : undefined);

      const resultMessage = `Verification failed due to unexpected error: ${errorMessage}`;
      return this.createFailedResult(document.id, document.fileHash, resultMessage, document.transactionHash);
    }
  }

  private createSuccessfulResult(
    documentId: string,
    fileHash: string,
    validHash: boolean,
    transactionHash: string,
    blockNumber: number,
    blockTimestamp: Date,
  ): VerifyCsvDocumentIntegrityResultEntity {
    const status = validHash ? CsvDocumentIntegrityStatus.VERIFIED : CsvDocumentIntegrityStatus.MISMATCH;
    const message = validHash
      ? `File integrity verified successfully for document with id ${documentId}.`
      : `File integrity mismatch for document with id ${documentId}.`;

    return this.createResult(documentId, fileHash, status, message, transactionHash, blockNumber, blockTimestamp);
  }

  private createFailedResult(
    documentId: string,
    fileHash: string | null,
    message: string,
    transactionHash: string | null,
  ): VerifyCsvDocumentIntegrityResultEntity {
    return this.createResult(
      documentId,
      fileHash,
      CsvDocumentIntegrityStatus.FAILED,
      message,
      transactionHash,
      null,
      null,
    );
  }

  private createResult(
    documentId: string,
    fileHash: string | null,
    status: CsvDocumentIntegrityStatus,
    message: string,
    transactionHash: string | null,
    blockNumber: number | null,
    blockTimestamp: Date | null,
  ): VerifyCsvDocumentIntegrityResultEntity {
    const { blockchainEnabled } = this.blockchainService;
    const explorerUrl =
      blockchainEnabled && transactionHash ? `${this.blockchainService.explorerUrl}/${transactionHash}` : null;
    const network = blockchainEnabled ? this.blockchainService.rpcUrl : null;
    const smartContractAddress = blockchainEnabled ? this.blockchainService.smartContractAddress : null;

    return new VerifyCsvDocumentIntegrityResultEntity(
      documentId,
      fileHash,
      status,
      message,
      transactionHash,
      blockNumber,
      blockTimestamp,
      network,
      smartContractAddress,
      explorerUrl,
    );
  }
}
