/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { CsvDocumentEntity, ReadByIdPayload } from '@h2-trust/amqp';
import { CsvImportRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { BlockchainService, HashUtil } from '@h2-trust/blockchain';

@Injectable()
export class CsvDocumentService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly storageService: StorageService
  ) { }

  async findByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.csvImportRepository.findAllCsvDocumentsByCompanyId(payload.id);
  }

  async verifyCsvDocumentIntegrity(payload: ReadByIdPayload): Promise<boolean> {
    const document = await this.csvImportRepository.findCsvDocumentById(payload.id);

    if (!document) {
      throw Error(`Document with id ${payload.id} does not exist, cannot verify file.`);
    }

    if (!document.transactionHash) {
      throw Error(`Document with id ${payload.id} has no transaction hash, cannot verify file.`);
    }

    const fileExists = await this.storageService.fileExists(document.fileName);

    if (!fileExists) {
      throw Error(`File with name ${document.fileName} does not exist, cannot verify file.`);
    }

    const fileStream = await this.storageService.downloadFile(document.fileName);
    const proof = await this.blockchainService.retrieveProof(document.id);
    const isValid = await HashUtil.verifyStreamWithStoredHash(fileStream, proof.hash);

    this.logger.debug(`${isValid ? '✅ Valid' : '❌ Invalid'} integrity for document with id ${document.id} and file name ${document.fileName}`);

    return isValid;
  }
}
