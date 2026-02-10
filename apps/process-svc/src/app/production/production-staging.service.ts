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
  DocumentEntity,
  ProductionStagingResultEntity,
  StageProductionsPayload,
  UnitAccountingPeriods,
  UnitFileReference,
} from '@h2-trust/amqp';
import { BlockchainService, HashUtil, ProofEntry } from '@h2-trust/blockchain';
import { ConfigurationService } from '@h2-trust/configuration';
import { DocumentRepository, PrismaService, StagedProductionRepository } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { AccountingPeriodCsvParser } from './accounting-period-csv-parser';
import { ProductionDistributor } from './production-distributor';

interface DocumentProofData {
  fileName: string;
  hash: string;
  cid: string;
}

interface PreparedProductionData<T extends AccountingPeriodPower | AccountingPeriodHydrogen> extends DocumentProofData {
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
    private readonly documentRepository: DocumentRepository,
    private readonly prismaService: PrismaService,
  ) {
    // TODO-MP: temporary solution until we have the file upload in the BFF and can store the IPFS CID directly (DUHGW-341)
    const minio = this.configurationService.getGlobalConfiguration().minio;
    this.minioUrl = `${minio.endPoint}:${minio.port}/${minio.bucketName}`;
  }

  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    const [preparedPowerProductionData, preparedHydrogenProductionData] = await Promise.all([
      this.prepareProductionData<AccountingPeriodPower>(payload.powerProductions, BatchType.POWER),
      this.prepareProductionData<AccountingPeriodHydrogen>(payload.hydrogenProductions, BatchType.HYDROGEN),
    ]);

    const distributedProductions = ProductionDistributor.distributeProductions(
      preparedPowerProductionData.map((pr) => pr.periods),
      preparedHydrogenProductionData.map((hr) => hr.periods),
      payload.gridPowerProductionUnitId,
    );

    const preparedProductionData = [...preparedPowerProductionData, ...preparedHydrogenProductionData];

    const { storedImportId, storedDocuments } = await this.prismaService.$transaction(async (tx) => {
      const storedImportId = await this.stagedProductionRepository.stageParsedProductions(distributedProductions, tx);

      const fileNames = preparedProductionData.map((ppd) => ppd.fileName);
      const storedDocuments = await this.documentRepository.createDocumentsWithFileName(fileNames, tx);

      return { storedImportId, storedDocuments };
    });

    await this.storeBlockchainProofs(preparedProductionData, storedDocuments);

    return new ProductionStagingResultEntity(storedImportId, distributedProductions);
  }

  private async prepareProductionData<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    unitFileReferences: UnitFileReference[],
    type: Exclude<BatchType, BatchType.WATER>,
  ): Promise<PreparedProductionData<T>[]> {
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
          hash,
          cid: `${this.minioUrl}/${ufr.fileName}`,
        };
      }),
    );
  }

  private async storeBlockchainProofs(
    documentProofData: DocumentProofData[],
    storedDocuments: DocumentEntity[],
  ): Promise<void> {
    const storedDocumentsByFileName = new Map(storedDocuments.map((sd) => [sd.fileName, sd]));

    const proofEntries: ProofEntry[] = documentProofData.map((dpd) => {
      const storedDocument = storedDocumentsByFileName.get(dpd.fileName);
      if (!storedDocument) {
        throw new BrokerException(
          `Document with file name ${dpd.fileName} not found in database after creation.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { uuid: storedDocument.id, hash: dpd.hash, cid: dpd.cid };
    });

    const txHash = await this.blockchainService.storeProofs(proofEntries);
    this.logger.debug(`Stored ${proofEntries.length} proofs in tx ${txHash}`);

    await this.documentRepository.updateDocumentsWithTransactionHash(
      storedDocuments.map((doc) => doc.id),
      txHash,
    );
  }
}
