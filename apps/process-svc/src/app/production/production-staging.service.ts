/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PassThrough } from 'stream';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  ParsedProductionMatchingResultEntity,
  StageProductionsPayload,
  UnitAccountingPeriods,
  UnitFileReference,
} from '@h2-trust/amqp';
import { HashUtil, BlockchainService } from '@h2-trust/blockchain';
import { ConfigurationService } from '@h2-trust/configuration';
import { DocumentRepository, StagedProductionRepository } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { AccountingPeriodCsvParser } from './accounting-period-csv-parser';
import { AccountingPeriodMatcher } from './accounting-period-matcher';

interface FileProofData {
  fileName: string;
  cid: string;
  hash: string;
}

interface ImportResult<T extends AccountingPeriodPower | AccountingPeriodHydrogen> extends FileProofData {
  periods: UnitAccountingPeriods<T>;
}

@Injectable()
export class ProductionStagingService {
  private static readonly validHeaders: Record<Exclude<BatchType, BatchType.WATER>, string[]> = {
    POWER: ['time', 'amount'],
    HYDROGEN: ['time', 'amount', 'power'],
  };

  private readonly logger = new Logger(this.constructor.name);
  private readonly minioUrl: string;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly storageService: StorageService,
    private readonly blockchainService: BlockchainService,
    private readonly documentRepository: DocumentRepository
  ) {
    // TODO-MP: temporary solution until we have the file upload in the BFF and can store the IPFS CID directly (DUHGW-341)
    const minio = this.configurationService.getGlobalConfiguration().minio;
    this.minioUrl = `${minio.endPoint}:${minio.port}/${minio.bucketName}`;
  }

  async stageProductions(payload: StageProductionsPayload): Promise<ParsedProductionMatchingResultEntity> {
    const [powerResults, hydrogenResults] = await Promise.all([
      this.importAccountingPeriods<AccountingPeriodPower>(payload.powerProductions, BatchType.POWER),
      this.importAccountingPeriods<AccountingPeriodHydrogen>(payload.hydrogenProductions, BatchType.HYDROGEN),
    ]);

    const parsedProductions = AccountingPeriodMatcher.matchAccountingPeriods(
      powerResults.map((pr) => pr.periods),
      hydrogenResults.map((hr) => hr.periods),
      payload.gridPowerProductionUnitId,
    );

    const importId = await this.stagedProductionRepository.stageParsedProductions(parsedProductions);
    const result = new ParsedProductionMatchingResultEntity(importId, parsedProductions);

    await this.storeDocumentProofs([...powerResults, ...hydrogenResults]);

    return result;
  }

  private async importAccountingPeriods<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    unitFileReferences: UnitFileReference[],
    type: Exclude<BatchType, BatchType.WATER>,
  ): Promise<ImportResult<T>[]> {
    const headers = ProductionStagingService.validHeaders[type];

    return Promise.all(
      unitFileReferences.map(async (ufr) => {
        const downloadingStream = await this.storageService.downloadFile(ufr.fileName);
        const hashingStream = new PassThrough();
        const parsingStream = new PassThrough();

        const cleanup = (err: Error) => {
          downloadingStream.destroy(err);
          hashingStream.destroy(err);
          parsingStream.destroy(err);
        };
        downloadingStream.on('error', cleanup);
        hashingStream.on('error', cleanup);
        parsingStream.on('error', cleanup);

        downloadingStream.pipe(hashingStream);
        downloadingStream.pipe(parsingStream);

        const [hash, accountingPeriods] = await Promise.all([
          HashUtil.hashStream(hashingStream),
          AccountingPeriodCsvParser.parseStream<T>(parsingStream, headers, ufr.fileName),
        ]);

        if (!accountingPeriods.length) {
          throw new BrokerException(
            `${type} production file does not contain any valid items.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          periods: new UnitAccountingPeriods<T>(ufr.unitId, accountingPeriods),
          fileName: ufr.fileName,
          cid: `${this.minioUrl}/${ufr.fileName}`,
          hash,
        };
      }),
    );
  }

  private async storeDocumentProofs(fileProofData: FileProofData[]): Promise<void> {
    const documents = await this.documentRepository.createDocumentsWithFileName(
      fileProofData.map((r) => r.fileName),
    );

    const documentsByFileName = new Map(documents.map((doc) => [doc.fileName, doc]));

    const allProofs = fileProofData.map((r) => {
      const document = documentsByFileName.get(r.fileName);
      if (!document) {
        throw new BrokerException(
          `Document with file name ${r.fileName} not found in database after creation.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { uuid: document.id, hash: r.hash, cid: r.cid };
    });

    const txHash = await this.blockchainService.storeProofs(allProofs);
    this.logger.debug(`Stored ${allProofs.length} proofs in tx ${txHash}`);

    await this.documentRepository.updateDocumentsWithTransactionHash(
      documents.map((doc) => doc.id),
      txHash,
    );
  }
}
