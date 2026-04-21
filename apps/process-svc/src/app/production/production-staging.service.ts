/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  BrokerException,
  CsvDocumentEntity,
  ProductionStagingResultEntity,
  StagedProductionEntity,
  StageProductionsPayload,
} from '@h2-trust/amqp';
import { BlockchainService, ProofEntry } from '@h2-trust/blockchain';
import { FeatureFlagService } from '@h2-trust/configuration';
import {
  CreateCsvDocumentInput,
  CsvImportRepository,
  PrismaService,
  StagedProductionRepository,
} from '@h2-trust/database';
import { CsvImportProcessingService } from './csv-import-processing.service';
import { ProductionNormalizer } from './production-normalizer';
import { DocumentProof, ParsedImport } from './production.types';

@Injectable()
export class ProductionStagingService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly csvImportProcessingService: CsvImportProcessingService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly prismaService: PrismaService,
    private readonly stagedProductionRepository: StagedProductionRepository,
  ) {}

  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    const parsedProductionImports: ParsedImport[] = await this.csvImportProcessingService.parseAndUploadFiles(
      payload.productionImports,
    );

    const stagedProductions: StagedProductionEntity[] = ProductionNormalizer.normalizeProduction(
      parsedProductionImports,
      payload.companyId,
    );

    const { csvImportId, csvDocuments } = await this.prismaService.$transaction(async (tx) => {
      const csvImportId = await this.csvImportRepository.saveCsvImport(payload.userId, tx);
      const csvDocumentInputs: CreateCsvDocumentInput[] =
        this.csvImportProcessingService.createCsvDocumentInputs(parsedProductionImports);
      const csvDocuments = await this.csvImportRepository.saveCsvDocuments(csvImportId, csvDocumentInputs, tx);

      await this.stagedProductionRepository.saveStagedProduction(stagedProductions, csvImportId, tx);

      return { csvImportId, csvDocuments };
    });

    await this.storeProofsOnBlockchain(parsedProductionImports, csvDocuments);
    return new ProductionStagingResultEntity(csvImportId, stagedProductions);
  }

  private async storeProofsOnBlockchain(
    documentProofs: DocumentProof[],
    csvDocuments: CsvDocumentEntity[],
  ): Promise<void> {
    if (!this.featureFlagService.verificationEnabled) {
      this.logger.debug(`Blockchain integration disabled, skipping proof storage of ${documentProofs.length} entries`);
      return;
    }

    if (documentProofs.length !== csvDocuments.length) {
      throw new BrokerException(
        `Number of document proofs (${documentProofs.length}) does not match number of CSV documents (${csvDocuments.length}).`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      throw error;
    }
  }
}
