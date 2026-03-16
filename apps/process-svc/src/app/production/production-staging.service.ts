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
import { BlockchainService, HashUtil, Proof } from '@h2-trust/blockchain';
import {
  CreateCsvDocumentInput,
  CsvImportRepository,
  PrismaService,
  StagedProductionRepository,
} from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { DecentralizedStorageService } from '@h2-trust/storage';
import { AccountingPeriodCsvParser } from './accounting-period-csv-parser';
import { ProductionDistributor } from './production-distributor';

export interface DocumentProof {
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
    private readonly storageService: DecentralizedStorageService,
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

    const { savedCsvImportId, savedCsvDocuments } = await this.prismaService.$transaction(async (tx) => {
      const savedCsvImportId = await this.csvImportRepository.saveCsvImport(payload.userId, tx);

      const documentInputs = this.assembleCsvDocumentInputs(preparedProductions);
      const savedCsvDocuments = await this.csvImportRepository.saveCsvDocuments(savedCsvImportId, documentInputs, tx);

      await this.stagedProductionRepository.stageDistributedProductions(distributedProductions, savedCsvImportId, tx);

      return { savedCsvImportId, savedCsvDocuments };
    });

    await this.storeBlockchainProofs(preparedProductions, savedCsvDocuments);

    return new ProductionStagingResultEntity(savedCsvImportId, distributedProductions);
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
        const originalHash = ufi.hashedFileBuffer;

        if (computedHash !== originalHash) {
          throw new Error(`File integrity check failed for unit ${ufi.unitId}: expected hash ${originalHash} but computed ${computedHash}`);
        }

        const accountingPeriods = await AccountingPeriodCsvParser.parseBuffer<T>(buffer, headers);

        if (!accountingPeriods.length) {
          throw new Error(`${type} production file does not contain any valid items.`);
        }

        const fileName = `${originalHash}.csv`;
        const cid = await this.storageService.uploadCsvFile(fileName, buffer);
        console.log(`Uploaded file for unit ${ufi.unitId} with fileName ${fileName} to storage, received CID: ${cid}`);

        return {
          periods: new UnitAccountingPeriods<T>(ufi.unitId, accountingPeriods),
          type,
          hash: originalHash,
          cid: cid
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
        fileHash: production.hash,
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

    const csvDocumentsByFileHash = new Map(csvDocuments.map((csvDocument) => [csvDocument.fileHash, csvDocument]));

    const proofs: Proof[] = documentProofs.map((documentProof) => {
      const csvDocument = csvDocumentsByFileHash.get(documentProof.hash);
      if (!csvDocument) {
        throw new BrokerException(
          `CSV document with hash ${documentProof.hash} not found in database after creation.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { uuid: csvDocument.id, hash: documentProof.hash, cid: documentProof.cid };
    });

    try {
      const txHash = await this.blockchainService.storeProofs(proofs);
      this.logger.debug(`✅ Stored ${proofs.length} proofs in tx ${txHash}`);

      await this.csvImportRepository.updateTransactionHash(
        csvDocuments.map((csvDocument) => csvDocument.id),
        txHash,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store proofs for documents on-chain: ${documentProofs.map((d) => d.hash).join(', ')}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
