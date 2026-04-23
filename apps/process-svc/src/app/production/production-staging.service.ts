/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BlockchainService, ProofEntry } from '@h2-trust/blockchain';
import { FeatureFlagService } from '@h2-trust/configuration';
import {
  ConcreteUnitEntity,
  CreateProductionEntity,
  CsvDocumentEntity,
  HydrogenProductionUnitEntity,
  PowerPurchaseAgreementEntity,
  ProcessStepEntity,
  ProductionStagingResultEntity,
  StagedProductionEntity,
} from '@h2-trust/contracts/entities';
import {
  FinalizeProductionsPayload,
  ReadByIdsPayload,
  ReadStagedProductionsPayload,
  StageProductionsPayload,
} from '@h2-trust/contracts/payloads';
import {
  CreateCsvDocumentInput,
  CsvImportRepository,
  PowerPurchaseAgreementRepository,
  PrismaService,
  StagedProductionRepository,
} from '@h2-trust/database';
import {
  CsvContentType,
  EnergySource,
  HydrogenColor,
  PowerPurchaseAgreementStatus,
  PowerType,
  StagingScope,
} from '@h2-trust/domain';
import { BrokerException, BrokerQueues, UnitMessagePatterns } from '@h2-trust/messaging';
import { CsvImportProcessingService } from './csv-import-processing.service';
import { ProductionCreationService } from './production-creation.service';
import { ProductionNormalizer } from './production-normalizer';
import { DocumentProof, ParsedImport } from './production.types';
import { ProductionUtils } from './utils/production.utils';

@Injectable()
export class ProductionStagingService {
  private readonly logger = new Logger(this.constructor.name);

  //TODO-LG: move grid power unit id into env vairables
  private readonly gridPowerUnitId: string = 'power-production-unit-3';

  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly productionCreationService: ProductionCreationService,
    private readonly blockchainService: BlockchainService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly csvImportProcessingService: CsvImportProcessingService,
    private readonly csvImportRepository: CsvImportRepository,
    private readonly prismaService: PrismaService,
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly powerPurchaseAgreementRepository: PowerPurchaseAgreementRepository,
  ) {}

  private async getProductionUnits(productionUnitIds: string[]): Promise<Map<string, ConcreteUnitEntity>> {
    const productionUnits: ConcreteUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_MANY_BY_IDS, new ReadByIdsPayload(productionUnitIds)),
    );
    return new Map<string, ConcreteUnitEntity>(
      productionUnits.map((productionUnit) => [productionUnit.id, productionUnit]),
    );
  }

  async readStagedProductions(payload: ReadStagedProductionsPayload): Promise<StagedProductionEntity[]> {
    if (payload.stagingScope == StagingScope.OWN) {
      return this.stagedProductionRepository.findStagedProductions(payload, true, []);
    } else {
      const approvedAgreements: PowerPurchaseAgreementEntity[] = await this.powerPurchaseAgreementRepository.findAll(
        payload.ownerId,
        PowerPurchaseAgreementStatus.APPROVED,
      );
      const accessibleUnitIds: string[] = approvedAgreements.map((approval) => approval.powerProductionUnit.id);
      return this.stagedProductionRepository.findStagedProductions(payload, false, accessibleUnitIds);
    }
  }

  //TODO-LG: fix problem with distributed power production (petra and hannes have both staged power productions)
  async createProductionsFromStaging(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
    const stagedProductions: StagedProductionEntity[] =
      await this.stagedProductionRepository.findStagedProductionsForIds([
        payload.stagedHydrogenProduction,
        ...payload.stagedPowerProductions,
      ]);

    const stagedHydrogenProduction: StagedProductionEntity = stagedProductions.find(
      (stagedProduction) => stagedProduction.type == CsvContentType.HYDROGEN,
    );
    const stagedPowerProductions: StagedProductionEntity[] = stagedProductions.filter(
      (stagedProduction) => stagedProduction.type == CsvContentType.POWER,
    );

    if (!stagedHydrogenProduction || stagedPowerProductions.length == 0) {
      throw new BrokerException(`The given Staged Production Ids are invalid`, HttpStatus.BAD_REQUEST);
    }

    const stagedProductionUnitIds: string[] = stagedProductions.map((stagedProduction) => stagedProduction.unitId);
    stagedProductionUnitIds.push(this.gridPowerUnitId);
    stagedProductionUnitIds.push(payload.storageUnitId);
    const productionUnitForId: Map<string, ConcreteUnitEntity> = await this.getProductionUnits(stagedProductionUnitIds);

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = productionUnitForId.get(
      stagedHydrogenProduction.unitId,
    ) as HydrogenProductionUnitEntity;

    const createRenewablePowerProductionEntity: CreateProductionEntity[] = stagedPowerProductions.map(
      (stagedPowerProduction) =>
        this.convertStagedProductionToProductionEntity(
          stagedHydrogenProduction,
          stagedPowerProduction,
          PowerType.RENEWABLE,
          payload.storageUnitId,
          hydrogenProductionUnit.waterConsumptionLitersPerHour,
          payload.recordedBy,
        ),
    );

    const createGridPowerProductionEntity: CreateProductionEntity[] = this.createGridPowerProductionEntity(
      stagedHydrogenProduction,
      stagedPowerProductions,
      payload.storageUnitId,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
      payload.recordedBy,
    );

    const createProductionEntities: CreateProductionEntity[] = [
      ...createRenewablePowerProductionEntity,
      ...createGridPowerProductionEntity,
    ];

    const persistedProcessSteps: ProcessStepEntity[] = await this.productionCreationService.createAndPersistProductions(
      createProductionEntities,
      productionUnitForId,
    );

    //TODO-LG: set the staged production to inactive
    //await this.setStagedProductionsToInactive([...stagedHydrogenProduction, ...stagedPowerProductions]);
    return persistedProcessSteps;
  }

  setStagedProductionsToInactive(stagedProductions: StagedProductionEntity[]) {
    const ids: string[] = stagedProductions.map((stagedProduction) => stagedProduction.id);
    return this.stagedProductionRepository.setStagedProductionsToInactive(ids);
  }

  createGridPowerProductionEntity(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
    hydrogenStorageUnitId: string,
    waterConsumption: number,
    recordedBy: string,
  ): CreateProductionEntity[] {
    const consumedGridPowerPercentage: number = ProductionUtils.calculateRequiredGridPowerPercentage(
      stagedHydrogenProduction,
      stagedPowerProductions,
    );

    if (consumedGridPowerPercentage == 0) {
      return [];
    }
    const girdPowerConsumed: number = (stagedHydrogenProduction.powerConsumed / 100) * consumedGridPowerPercentage;
    const amountProducedWithGridPower: number =
      (stagedHydrogenProduction.amountProduced / 100) * consumedGridPowerPercentage;
    const gridPowerCreateEntity: CreateProductionEntity = new CreateProductionEntity(
      stagedHydrogenProduction.startedAt,
      stagedHydrogenProduction.endedAt,
      this.gridPowerUnitId,
      PowerType.NOT_SPECIFIED,
      girdPowerConsumed,
      stagedHydrogenProduction.unitId,
      amountProducedWithGridPower,
      recordedBy,
      HydrogenColor.MIX,
      hydrogenStorageUnitId,
      stagedHydrogenProduction.ownerId,
      stagedHydrogenProduction.ownerId,
      waterConsumption,
    );
    return ProductionUtils.splitGridPowerProduction(gridPowerCreateEntity, EnergySource.GRID);
  }

  convertStagedProductionToProductionEntity(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProduction: StagedProductionEntity,
    powerType: PowerType,
    hydrogenStorageUnitId: string,
    waterConsumption: number,
    recordedBy: string,
  ): CreateProductionEntity {
    const percentageOfProducedPowerFromConsumedPower =
      stagedHydrogenProduction.powerConsumed != 0
        ? (stagedPowerProduction.amountProduced * 100) / stagedHydrogenProduction.powerConsumed
        : 0;

    //case: the power production is bigger than the required power
    if (percentageOfProducedPowerFromConsumedPower > 100) {
      //TODO-LG: Add a split of stagedPower here
    }

    if (percentageOfProducedPowerFromConsumedPower >= 100) {
      return new CreateProductionEntity(
        stagedHydrogenProduction.startedAt,
        stagedHydrogenProduction.endedAt,
        stagedPowerProduction.unitId,
        powerType,
        stagedHydrogenProduction.powerConsumed,
        stagedHydrogenProduction.unitId,
        stagedHydrogenProduction.amountProduced,
        recordedBy,
        HydrogenColor.MIX,
        hydrogenStorageUnitId,
        stagedPowerProduction.ownerId,
        stagedHydrogenProduction.ownerId,
        waterConsumption,
      );
    } else {
      const producedHydrogenAmount: number =
        (stagedHydrogenProduction.amountProduced / 100) * percentageOfProducedPowerFromConsumedPower;
      return new CreateProductionEntity(
        stagedHydrogenProduction.startedAt,
        stagedHydrogenProduction.endedAt,
        stagedPowerProduction.unitId,
        powerType,
        stagedPowerProduction.amountProduced,
        stagedHydrogenProduction.unitId,
        producedHydrogenAmount,
        recordedBy,
        HydrogenColor.MIX,
        hydrogenStorageUnitId,
        stagedPowerProduction.ownerId,
        stagedHydrogenProduction.ownerId,
        waterConsumption,
      );
    }
  }

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

      await this.stagedProductionRepository.saveStagedProductions(stagedProductions, csvImportId, tx);

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
