/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  CsvDocumentEntity,
  ProductionStagingResultEntity,
  StageProductionsPayload,
  UnitAccountingPeriods,
  UnitFileImport,
} from '@h2-trust/amqp';
import { BlockchainService, HashUtil, ProofEntry } from '@h2-trust/blockchain';
import {
  CreateCsvDocumentInput,
  CsvImportRepository,
  PrismaService,
  StagedProductionRepository,
} from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
//import { StorageService } from '@h2-trust/storage';
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
    //private readonly storageService: StorageService,
    private readonly blockchainService: BlockchainService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly prismaService: PrismaService,
  ) { }

  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    const [preparedPowerProductions, preparedHydrogenProductions] = await Promise.all([
      this.prepareProductions<AccountingPeriodPower>(payload.powerProductionImports, BatchType.POWER),
      this.prepareProductions<AccountingPeriodHydrogen>(payload.hydrogenProductionImports, BatchType.HYDROGEN),
    ]);

    console.log(preparedPowerProductions);
    console.log(preparedHydrogenProductions);

    const distributedProductions = ProductionDistributor.distributeProductions(
      preparedPowerProductions.map((power) => power.periods),
      preparedHydrogenProductions.map((hydrogen) => hydrogen.periods),
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
    unitFileImports: UnitFileImport[],
    type: Exclude<BatchType, BatchType.WATER>,
  ): Promise<PreparedProduction<T>[]> {
    const headers = ProductionStagingService.validHeaders[type];

    return Promise.all(
      unitFileImports.map(async (ufi) => {

        const buffer = Buffer.from(ufi.encodedFileBuffer, 'base64');
        const computedHash = HashUtil.hashBuffer(buffer);
        const fileHash = ufi.hashedFileBuffer;

        if (computedHash !== fileHash) {
          throw new Error(`File integrity check failed for unit ${ufi.unitId}: expected hash ${fileHash} but computed ${computedHash}`);
        }

        const accountingPeriods = await AccountingPeriodCsvParser.parseBuffer<T>(buffer, headers);

        if (!accountingPeriods.length) {
          throw new Error(`${type} production file does not contain any valid items.`);
        }

        return {
          periods: new UnitAccountingPeriods<T>(ufi.unitId, accountingPeriods),
          type,
          fileName: fileHash,
          hash: fileHash,
          cid: "tbd", // TODO-MP: store IPFS CID (DUHGW-341)
        };
      }),
    );
  }

  private assembleCsvDocumentInputs<T extends AccountingPeriodPower | AccountingPeriodHydrogen>(
    preparedProductions: PreparedProduction<T>[],
  ): CreateCsvDocumentInput[] {
    return preparedProductions.map((production) => {
      const { startedAt, endedAt, amount } = production.periods.accountingPeriods.reduce(
        (acc, accountingPeriod) => {
          const time = accountingPeriod.time.getTime();
          const amount = accountingPeriod.amount;

          return {
            startedAt: Math.min(acc.startedAt, time),
            endedAt: Math.max(acc.endedAt, time),
            amount: acc.amount + amount,
          };
        },
        { startedAt: Infinity, endedAt: -Infinity, amount: 0 },
      );

      return {
        type: production.type,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        fileName: production.fileName,
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

    const csvDocumentsByFileName = new Map(csvDocuments.map((csvDocument) => [csvDocument.fileName, csvDocument]));

    const proofEntries: ProofEntry[] = documentProofs.map((documentProof) => {
      const csvDocument = csvDocumentsByFileName.get(documentProof.fileName);
      if (!csvDocument) {
        throw new BrokerException(
          `CSV document with file name ${documentProof.fileName} not found in database after creation.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { uuid: csvDocument.id, hash: documentProof.hash, cid: documentProof.cid };
    });

    try {
      const txHash = await this.blockchainService.storeProofs(proofEntries);
      this.logger.debug(`✅ Stored ${proofEntries.length} proofs in tx ${txHash}`);

      await this.csvImportRepository.updateTransactionHash(
        csvDocuments.map((csvDocument) => csvDocument.id),
        txHash,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store proofs for documents on-chain: ${documentProofs.map((d) => d.fileName).join(', ')}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
