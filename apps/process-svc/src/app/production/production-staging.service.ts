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
  DefaultGridProvider,
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

  private readonly defaultGridPowerUnitId = DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID;

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

  /**
   * Retrieve the specific production unit objects for a list of production unit IDs via the general-svc.
   * @param productionUnitIds The production unit IDs to be used to retrieve the production units.
   * @returns The specific production unit objects are returned as a map so that the units can be retrieved and used later via their unit IDs.
   */
  private async getProductionUnits(
    productionUnitIds: string[],
    hydrogenStorageUnitId: string,
  ): Promise<Map<string, ConcreteUnitEntity>> {
    const unitIds: string[] = [...productionUnitIds, hydrogenStorageUnitId, this.defaultGridPowerUnitId];
    const productionUnits: ConcreteUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_MANY_BY_IDS, new ReadByIdsPayload(unitIds)),
    );

    return new Map<string, ConcreteUnitEntity>(
      productionUnits.map((productionUnit) => [productionUnit.id, productionUnit]),
    );
  }

  /**
   * Combines staged power production and staged hydrogen production to generate new process steps.
   * Sets the existing staged productions to inactive and creates new staged productions for the remaining amounts of power.
   * If the power supplied by the specified staged power production units is insufficient, GRID power will be used.
   * @param payload Information on finding and combining staged productions.
   * @returns The newly created process steps.
   */
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

    //get a map with all relevant units, that can be used without requesting it from the general-svc
    const stagedProductionUnitIds: string[] = stagedProductions.map((stagedProduction) => stagedProduction.unitId);
    const productionUnitForId: Map<string, ConcreteUnitEntity> = await this.getProductionUnits(
      stagedProductionUnitIds,
      payload.storageUnitId,
    );

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = productionUnitForId.get(
      stagedHydrogenProduction.unitId,
    ) as HydrogenProductionUnitEntity;

    //create and save the new process steps from the staged productions
    const createProductionEntity: CreateProductionEntity[] = this.getStagedProductionDistribution(
      stagedHydrogenProduction,
      stagedPowerProductions,
      payload.storageUnitId,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
      payload.recordedBy,
      this.defaultGridPowerUnitId,
    );

    const persistedProcessSteps: ProcessStepEntity[] = await this.productionCreationService.createAndPersistProductions(
      createProductionEntity,
      productionUnitForId,
    );

    await this.saveRemainingPowerProduction(stagedHydrogenProduction, stagedPowerProductions);

    await this.setStagedProductionsToInactive(stagedHydrogenProduction, stagedPowerProductions);

    return persistedProcessSteps;
  }

  /**
   * Accepts the provided information for matching staged hydrogen production and staged power production.
   * Matches the individual staged productions so that they result in valid new process steps.
   * @param stagedHydrogenProduction The staged hydrogen production object to be used for matching.
   * @param stagedPowerProductions The staged power production objects to be used for matching.
   * @param hydrogenStorageUnitId The hydrogen storage facility in which the produced hydrogen is to be stored.
   * @param waterConsumption The total amount of water required for hydrogen production.
   * @param recordedBy The user performing the finalisation.
   * @param gridPowerUnitId The Id of the default production unit for grid electricity.
   * @returns The new process steps to be saved.
   */
  getStagedProductionDistribution(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
    hydrogenStorageUnitId: string,
    waterConsumption: number,
    recordedBy: string,
    gridPowerUnitId: string,
  ): CreateProductionEntity[] {
    const createProductionEntities: CreateProductionEntity[] = [];

    let remainingPowerConsuption = stagedHydrogenProduction.powerConsumed;
    let remainingHydrogenProduction = stagedHydrogenProduction.amountProduced;

    //First, all staged power production processes selected for matching are reviewed, and new process steps are derived from them.
    //The staged hydrogen production is broken down step by step, depending on the amount of power available.
    for (const stagedPowerProduction of stagedPowerProductions) {
      const isCurrentPowerProductionSufficient: boolean =
        stagedPowerProduction.amountProduced >= remainingPowerConsuption;

      const powerConsumed: number = isCurrentPowerProductionSufficient
        ? remainingPowerConsuption
        : stagedPowerProduction.amountProduced;
      const amountProduced: number = isCurrentPowerProductionSufficient
        ? remainingHydrogenProduction
        : ProductionUtils.calculatePartialAmountRelativeToPowerProduction(
            stagedHydrogenProduction.amountProduced,
            stagedHydrogenProduction.powerConsumed,
            stagedPowerProduction.amountProduced,
          );

      const partialWaterConsumption: number = ProductionUtils.calculatePartialAmountRelativeToPowerProduction(
        waterConsumption,
        stagedHydrogenProduction.powerConsumed,
        stagedPowerProduction.amountProduced,
      );
      const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
        stagedHydrogenProduction.startedAt,
        stagedHydrogenProduction.endedAt,
        stagedPowerProduction.unitId,
        PowerType.RENEWABLE,
        powerConsumed,
        stagedHydrogenProduction.unitId,
        amountProduced,
        recordedBy,
        HydrogenColor.MIX,
        hydrogenStorageUnitId,
        stagedPowerProduction.ownerId,
        stagedHydrogenProduction.ownerId,
        partialWaterConsumption,
      );

      createProductionEntities.push(createProductionEntity);

      remainingPowerConsuption = remainingPowerConsuption - stagedPowerProduction.amountProduced;
      remainingHydrogenProduction = remainingHydrogenProduction - amountProduced;

      if (remainingPowerConsuption <= 0) {
        return createProductionEntities;
      }
    }

    //At this point, we still have remaining hydrogen production but no further staged power generation.
    // So the rest must be topped up with grid electricity.
    const partialWaterConsumption: number = ProductionUtils.calculatePartialAmountRelativeToPowerProduction(
      waterConsumption,
      stagedHydrogenProduction.powerConsumed,
      remainingPowerConsuption,
    );
    const gridPowerCreateEntity: CreateProductionEntity = new CreateProductionEntity(
      stagedHydrogenProduction.startedAt,
      stagedHydrogenProduction.endedAt,
      gridPowerUnitId,
      PowerType.NOT_SPECIFIED,
      remainingPowerConsuption,
      stagedHydrogenProduction.unitId,
      remainingHydrogenProduction,
      recordedBy,
      HydrogenColor.MIX,
      hydrogenStorageUnitId,
      stagedHydrogenProduction.ownerId,
      stagedHydrogenProduction.ownerId,
      partialWaterConsumption,
    );
    const gridPowerCreateEntities: CreateProductionEntity[] = ProductionUtils.splitGridPowerProduction(
      gridPowerCreateEntity,
      EnergySource.GRID,
    );

    createProductionEntities.push(...gridPowerCreateEntities);
    return createProductionEntities;
  }

  /**
   * Identify which of the specified staged production elements need to be deactivated.
   * These are all affected staged productions, with the exception of the power productions, which do not need to be used for matching.
   * @param stagedHydrogenProduction The staged hydrogen production, which is to be deactivated.
   * @param stagedPowerProductions The staged power production, which may need to be deactivated.
   */
  async setStagedProductionsToInactive(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
  ): Promise<void> {
    let stagedProductionsToSetInactive: StagedProductionEntity[] = [stagedHydrogenProduction];

    let remainingPowerConsuption = stagedHydrogenProduction.powerConsumed;

    for (const stagedPowerProduction of stagedPowerProductions) {
      remainingPowerConsuption = remainingPowerConsuption - stagedPowerProduction.amountProduced;
      stagedProductionsToSetInactive.push(stagedPowerProduction);

      if (remainingPowerConsuption < 0) {
        break;
      }
    }
    const ids: string[] = stagedProductionsToSetInactive.map((stagedProduction) => stagedProduction.id);
    const affectedColumns: number = await this.stagedProductionRepository.setStagedProductionsToInactive(ids);
    this.logger.debug(`${affectedColumns} staged productions have been deactivated`);
  }

  /**
   * Check whether any of the staged power productions used for matching have been used only partially.
   * Save the remaining amount of the power production as a new staged power production.
   * @param stagedHydrogenProduction The staged hydrogen production used for the matching.
   * @param stagedPowerProductions The staged power production used for the matching.
   */
  async saveRemainingPowerProduction(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
  ): Promise<void> {
    let remainingPowerConsuption = stagedHydrogenProduction.powerConsumed;

    for (const stagedPowerProduction of stagedPowerProductions) {
      remainingPowerConsuption = remainingPowerConsuption - stagedPowerProduction.amountProduced;
      if (remainingPowerConsuption < 0) {
        const remainingPowerProduction: number = Math.abs(remainingPowerConsuption);
        const splittedPowerProduction: StagedProductionEntity = new StagedProductionEntity(
          undefined,
          stagedPowerProduction.startedAt,
          stagedPowerProduction.endedAt,
          remainingPowerProduction,
          stagedPowerProduction.unitId,
          stagedPowerProduction.ownerId,
          stagedPowerProduction.powerConsumed,
          stagedPowerProduction.type,
          stagedPowerProduction.csvImportId,
        );
        if (splittedPowerProduction) {
          this.logger.debug(`The remainig power of ${splittedPowerProduction.amountProduced} was persisted.`);
          await this.stagedProductionRepository.saveStagedProductions(
            [splittedPowerProduction],
            splittedPowerProduction.csvImportId,
          );
        }
      }
    }
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
