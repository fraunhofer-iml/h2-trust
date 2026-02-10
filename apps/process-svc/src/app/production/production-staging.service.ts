/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PassThrough } from 'stream';
import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  BrokerQueues,
  ParsedProductionMatchingResultEntity,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  ReadPowerAccessApprovalsPayload,
  StageProductionsPayload,
  UnitAccountingPeriods,
  UnitFileReference,
} from '@h2-trust/amqp';
import { HashUtil, BlockchainService, ProofEntry } from '@h2-trust/blockchain';
import { ConfigurationService } from '@h2-trust/configuration';
import { DocumentRepository, StagedProductionRepository } from '@h2-trust/database';
import { BatchType, PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
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
  private static readonly headersForBatchType: Record<BatchType, string[]> = {
    POWER: ['time', 'amount'],
    HYDROGEN: ['time', 'amount', 'power'],
    WATER: [], // empty on purpose, no water import supported
  };

  private readonly logger = new Logger(this.constructor.name);
  private readonly minioUrl: string;

  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
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
    const [powerResults, hydrogenResults, gridUnitId] = await Promise.all([
      this.importAccountingPeriods<AccountingPeriodPower>(payload.powerProductions, BatchType.POWER),
      this.importAccountingPeriods<AccountingPeriodHydrogen>(payload.hydrogenProductions, BatchType.HYDROGEN),
      this.fetchGridUnitId(payload.userId),
    ]);

    await this.storeDocumentProofs([...powerResults, ...hydrogenResults]);

    const parsedProductions = AccountingPeriodMatcher.matchAccountingPeriods(
      powerResults.map((pr) => pr.periods),
      hydrogenResults.map((hr) => hr.periods),
      gridUnitId,
    );

    const importId = await this.stagedProductionRepository.stageParsedProductions(parsedProductions);

    return new ParsedProductionMatchingResultEntity(importId, parsedProductions);
  }

  private async importAccountingPeriods<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    unitFileReferences: UnitFileReference[],
    type: BatchType,
  ): Promise<ImportResult<T>[]> {
    const headers = ProductionStagingService.headersForBatchType[type];

    return Promise.all(
      unitFileReferences.map(async (ufr) => {
        const downloadingStream = await this.storageService.downloadFile(ufr.fileName);
        const hashingStream = new PassThrough();
        const parsingStream = new PassThrough();
        downloadingStream.on('error', (err) => {
          hashingStream.destroy(err);
          parsingStream.destroy(err);
        });
        downloadingStream.pipe(hashingStream);
        downloadingStream.pipe(parsingStream);

        const [hash, accountingPeriods] = await Promise.all([
          HashUtil.hashStream(hashingStream),
          AccountingPeriodCsvParser.parseStream<T>(parsingStream, headers, ufr.fileName),
        ]);

        if (accountingPeriods.length < 1) {
          throw new BrokerException(
            `${type} production file does not contain any valid items.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const cid = this.minioUrl + '/' + ufr.fileName; // temporary solution until we have uploaded file in bff to ipfs

        return {
          periods: new UnitAccountingPeriods<T>(ufr.unitId, accountingPeriods),
          fileName: ufr.fileName,
          cid,
          hash,
        };
      }),
    );
  }

  private async fetchGridUnitId(userId: string): Promise<string> {
    const approvals: PowerAccessApprovalEntity[] = await firstValueFrom(
      this.generalSvc.send(
        PowerAccessApprovalPatterns.READ,
        new ReadPowerAccessApprovalsPayload(userId, PowerAccessApprovalStatus.APPROVED),
      ),
    );
    const approvalForGrid = approvals.find(
      (approval) => approval.powerProductionUnit.type.name === PowerProductionType.GRID,
    );

    if (!approvalForGrid)
      throw new BrokerException(
        `No grid connection found for user with id ${userId}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return approvalForGrid.powerProductionUnit.id;
  }

  private async storeDocumentProofs(fileProofData: FileProofData[]): Promise<void> {
    const documents = await this.documentRepository.createDocumentsWithFileName(
      fileProofData.map((r) => r.fileName),
    );

    const documentsByFileName = new Map(documents.map((doc) => [doc.fileName, doc]));

    const allProofs: ProofEntry[] = fileProofData.map((r) => {
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
    this.logger.log(`Stored ${allProofs.length} proofs in tx ${txHash}`);

    await this.documentRepository.updateDocumentsWithTransactionHash(
      documents.map((doc) => doc.id),
      txHash,
    );
  }
}
