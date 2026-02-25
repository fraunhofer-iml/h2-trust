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
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class CsvDocumentService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly storageService: StorageService,
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

    if (!this.blockchainService.blockchainEnabled) {
      const message = 'Blockchain integration is disabled, cannot verify file integrity.';
      return this.createFailedResult(document.id, document.fileName, message, document.transactionHash);
    }

    if (!document.transactionHash) {
      const message = `Document with id ${document.id} has no transaction hash, cannot verify file.`;
      return this.createFailedResult(document.id, document.fileName, message, document.transactionHash);
    }

    try {
      if (!(await this.storageService.fileExists(document.fileName))) {
        const message = `File with name ${document.fileName} does not exist in storage, cannot verify file.`;
        return this.createFailedResult(document.id, document.fileName, message, document.transactionHash);
      }

      const [fileStream, proof] = await Promise.all([
        this.storageService.downloadFile(document.fileName),
        this.blockchainService.retrieveProof(document.id),
      ]);

      if (!proof) {
        const message = `No blockchain proof found for document with id ${document.id}, cannot verify file.`;
        return this.createFailedResult(document.id, document.fileName, message, document.transactionHash);
      }

      const validHash = await HashUtil.verifyStreamWithStoredHash(fileStream, proof.hash);

      this.logger.debug(
        `${validHash ? '✅ Valid' : '❌ Invalid'} integrity for document with id ${document.id} and file name ${document.fileName}`,
      );

      const blockchainMetadata = await this.blockchainService.retrieveBlockchainMetadata(document.transactionHash);

      return this.createSuccessfulResult(
        document.id,
        document.fileName,
        validHash,
        document.transactionHash,
        blockchainMetadata.blockNumber,
        blockchainMetadata.blockTimestamp
      );
    } catch (error) {
      this.logger.error(
        `Failed to verify integrity for document with id ${document.id} and file name ${document.fileName}`,
        error instanceof Error ? error.stack : undefined,
      );

      const message = 'Verification failed due to unexpected error.';
      return this.createFailedResult(document.id, document.fileName, message, document.transactionHash);
    }
  }

  private createSuccessfulResult(
    documentId: string,
    fileName: string,
    validHash: boolean,
    transactionHash: string,
    blockNumber: number,
    blockTimestamp: Date,
  ): VerifyCsvDocumentIntegrityResultEntity {
    const status = validHash
      ? CsvDocumentIntegrityStatus.VERIFIED
      : CsvDocumentIntegrityStatus.MISMATCH;
    const message = validHash
      ? `File integrity verified successfully for document with id ${documentId}.`
      : `File integrity mismatch for document with id ${documentId}.`;

    return this.createResult(
      documentId,
      fileName,
      status,
      message,
      transactionHash,
      blockNumber,
      blockTimestamp,
    );
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
    );
  }

  private createResult(
    documentId: string,
    fileName: string | null,
    status: CsvDocumentIntegrityStatus,
    message: string,
    transactionHash: string | null,
    blockNumber: number | null,
    blockTimestamp: Date | null
  ): VerifyCsvDocumentIntegrityResultEntity {
    const explorerUrl = transactionHash
      ? `${this.blockchainService.explorerUrl}/${transactionHash}`
      : null;
    const network = this.blockchainService.blockchainEnabled
      ? this.blockchainService.rpcUrl
      : null;
    const smartContractAddress = this.blockchainService.blockchainEnabled
      ? this.blockchainService.smartContractAddress
      : null;

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
      explorerUrl,
    );
  }
}
