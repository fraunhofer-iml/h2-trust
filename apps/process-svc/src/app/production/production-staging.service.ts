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
  CsvDocumentEntity,
  ProductionStagingResultEntity,
  StageProductionsPayload,
  UnitAccountingPeriods,
  UnitFileReference,
} from '@h2-trust/amqp';
import { BlockchainService, HashUtil, ProofEntry } from '@h2-trust/blockchain';
import { CreateCsvDocumentInput, CsvImportRepository, PrismaService, StagedProductionRepository } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { AccountingPeriodCsvParser } from './accounting-period-csv-parser';
import { ProductionDistributor } from './production-distributor';

interface DocumentProof {
  fileName: string;
  hash: string;
  cid: string;
}

interface PreparedProduction<T extends AccountingPeriodPower | AccountingPeriodHydrogen> extends DocumentProof {
  periods: UnitAccountingPeriods<T>;
  type: Exclude<BatchType, BatchType.WATER>;
}

@Injectable()
export class ProductionStagingService {
  private static readonly validHeaders: Record<Exclude<BatchType, BatchType.WATER>, string[]> = {
    POWER: ['time', 'amount'],
    HYDROGEN: ['time', 'amount', 'power'],
  };

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly storageService: StorageService,
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly prismaService: PrismaService,
  ) { }

  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    const [preparedPowerProductions, preparedHydrogenProductions] = await Promise.all([
      this.prepareProductions<AccountingPeriodPower>(payload.powerProductions, BatchType.POWER),
      this.prepareProductions<AccountingPeriodHydrogen>(payload.hydrogenProductions, BatchType.HYDROGEN),
    ]);

    const distributedProductions = ProductionDistributor.distributeProductions(
      preparedPowerProductions.map((ppp) => ppp.periods),
      preparedHydrogenProductions.map((php) => php.periods),
      payload.gridPowerProductionUnitId,
    );

    const preparedProductions = [...preparedPowerProductions, ...preparedHydrogenProductions];

    const { csvImportId, csvDocuments } = await this.prismaService.$transaction(async (tx) => {
      const csvImportId = await this.csvImportRepository.createCsvImport(payload.userId, tx);

      const documentInputs = this.assembleCsvDocumentInputs(preparedProductions);
      const csvDocuments = await this.csvImportRepository.createCsvDocuments(csvImportId, documentInputs, tx);

      await this.stagedProductionRepository.stageDistributedProductions(distributedProductions, csvImportId, tx);

      return { csvImportId, csvDocuments };
    });

    await this.storeBlockchainProofs(preparedProductions, csvDocuments);

    return new ProductionStagingResultEntity(csvImportId, distributedProductions);
  }

  private async prepareProductions<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    unitFileReferences: UnitFileReference[],
    type: Exclude<BatchType, BatchType.WATER>,
  ): Promise<PreparedProduction<T>[]> {
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
          type,
          fileName: ufr.fileName,
          hash,
          cid: ufr.fileName, // TODO-MP: store IPFS CID (DUHGW-341)
        };
      }),
    );
  }

  private assembleCsvDocumentInputs<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    preparedProductions: PreparedProduction<T>[],
  ): CreateCsvDocumentInput[] {
    return preparedProductions.map((ppp) => {
      const { startedAt, endedAt, amount } = ppp.periods.accountingPeriods.reduce(
        (acc, element) => {
          const elementTime = new Date(element.time).getTime();
          return {
            startedAt: Math.min(acc.startedAt, elementTime),
            endedAt: Math.max(acc.endedAt, elementTime),
            amount: acc.amount + element.amount,
          };
        },
        { startedAt: Infinity, endedAt: -Infinity, amount: 0 },
      );

      return {
        type: ppp.type,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        fileName: ppp.fileName,
        amount,
      };
    });
  }

  private async storeBlockchainProofs(
    documentProofs: DocumentProof[],
    csvDocuments: CsvDocumentEntity[],
  ): Promise<void> {
    if (!this.blockchainService.blockchainEnabled) {
      this.logger.debug(`⏭️ Blockchain disabled, skipping proof storage of ${documentProofs.length} entries`);
      return;
    }

    const csvDocumentsByFileName = new Map(csvDocuments.map((cd) => [cd.fileName, cd]));

    const proofEntries: ProofEntry[] = documentProofs.map((dpd) => {
      const csvDocument = csvDocumentsByFileName.get(dpd.fileName);
      if (!csvDocument) {
        throw new BrokerException(
          `CSV document with file name ${dpd.fileName} not found in database after creation.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { uuid: csvDocument.id, hash: dpd.hash, cid: dpd.cid };
    });

    const txHash = await this.blockchainService.storeProofs(proofEntries);
    this.logger.debug(`✅ Stored ${proofEntries.length} proofs in tx ${txHash}`);

    await this.csvImportRepository.updateTransactionHash(
      csvDocuments.map((doc) => doc.id),
      txHash,
    );
  }
}
