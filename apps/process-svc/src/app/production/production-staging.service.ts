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
  PowerProductionUnitEntity,
  PowerPurchaseAgreementEntity,
  ProcessStepEntity,
  ProductionStagingResultEntity,
  StagedProductionEntity,
} from '@h2-trust/contracts/entities';
import {
  FinalizeProductionsPayload,
  ReadByIdPayload,
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
  private readonly gridPowerSupplier: string = 'company-grid-0';

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

  private async getOwnGridPowerProductionUnit(): Promise<PowerProductionUnitEntity> {
    const ownPowerProductions: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION, new ReadByIdPayload(this.gridPowerSupplier)),
    );
    const ownGridPowerProduction: PowerProductionUnitEntity = ownPowerProductions.find(
      (powerProduction) => powerProduction.type.energySource == EnergySource.GRID,
    );
    if (!ownGridPowerProduction) {
      throw new BrokerException(`The user does not have a GRID power production`, HttpStatus.BAD_REQUEST);
    }
    return ownGridPowerProduction;
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

    const gridPowerUnit: PowerProductionUnitEntity = await this.getOwnGridPowerProductionUnit();

    const stagedProductionUnitIds: string[] = stagedProductions.map((stagedProduction) => stagedProduction.unitId);
    stagedProductionUnitIds.push(payload.storageUnitId);
    const productionUnitForId: Map<string, ConcreteUnitEntity> = await this.getProductionUnits(stagedProductionUnitIds);
    productionUnitForId.set(gridPowerUnit.id, gridPowerUnit);

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = productionUnitForId.get(
      stagedHydrogenProduction.unitId,
    ) as HydrogenProductionUnitEntity;

    const createProductionEntity: CreateProductionEntity[] = this.getStagedProductionDistribution(
      stagedHydrogenProduction,
      stagedPowerProductions,
      payload.storageUnitId,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
      payload.recordedBy,
      gridPowerUnit.id,
    );

    this.getRemainingPowerProduction(stagedHydrogenProduction, stagedPowerProductions);

    const persistedProcessSteps: ProcessStepEntity[] = await this.productionCreationService.createAndPersistProductions(
      createProductionEntity,
      productionUnitForId,
    );

    const stagedProductionsToInactivate: StagedProductionEntity[] = this.getStagedProductionsToSetInactive(
      stagedHydrogenProduction,
      stagedPowerProductions,
    );

    await this.setStagedProductionsToInactive(stagedProductionsToInactivate);
    return persistedProcessSteps;
  }

  setStagedProductionsToInactive(stagedProductions: StagedProductionEntity[]) {
    const ids: string[] = stagedProductions.map((stagedProduction) => stagedProduction.id);
    return this.stagedProductionRepository.setStagedProductionsToInactive(ids);
  }

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

    for (const stagedPowerProduction of stagedPowerProductions) {
      if (stagedPowerProduction.amountProduced >= remainingPowerConsuption) {
        //since the current power production is sufficient to take care of the remaining power consumption we can return the list with this power production.
        const powerUsed: number = remainingPowerConsuption;
        const amountProduced: number = remainingHydrogenProduction;

        const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
          stagedHydrogenProduction.startedAt,
          stagedHydrogenProduction.endedAt,
          stagedPowerProduction.unitId,
          PowerType.RENEWABLE,
          powerUsed,
          stagedHydrogenProduction.unitId,
          amountProduced,
          recordedBy,
          HydrogenColor.MIX,
          hydrogenStorageUnitId,
          stagedPowerProduction.ownerId,
          stagedHydrogenProduction.ownerId,
          waterConsumption,
        );
        createProductionEntities.push(createProductionEntity);
        return createProductionEntities;
      } else {
        //add one createProductionEntity with amountProduced of stagedProduction.amountProduced
        //wen need the share of the produced power from the total power consumption of the hydrogen production
        const powerUsed: number = stagedPowerProduction.amountProduced;

        const shareOfPowerProductionFromTotalPowerConsumption: number =
          (stagedPowerProduction.amountProduced * 100) / stagedHydrogenProduction.powerConsumed;
        const amountProduced: number =
          (stagedHydrogenProduction.amountProduced / 100) * shareOfPowerProductionFromTotalPowerConsumption;
        const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
          stagedHydrogenProduction.startedAt,
          stagedHydrogenProduction.endedAt,
          stagedPowerProduction.unitId,
          PowerType.RENEWABLE,
          powerUsed,
          stagedHydrogenProduction.unitId,
          amountProduced,
          recordedBy,
          HydrogenColor.MIX,
          hydrogenStorageUnitId,
          stagedPowerProduction.ownerId,
          stagedHydrogenProduction.ownerId,
          waterConsumption,
        );
        createProductionEntities.push(createProductionEntity);

        remainingPowerConsuption = remainingPowerConsuption - stagedPowerProduction.amountProduced;
        remainingHydrogenProduction = remainingHydrogenProduction - amountProduced;
      }
    }

    //at this point we have remaining power consumption and hydrogen production and no remaining power production
    //the remaining amounts will be created via GRID
    const gridPowerConsumed: number = remainingPowerConsuption;
    const amountOfHydrogenProducedWithGridPower: number = remainingHydrogenProduction;

    const gridPowerCreateEntity: CreateProductionEntity = new CreateProductionEntity(
      stagedHydrogenProduction.startedAt,
      stagedHydrogenProduction.endedAt,
      gridPowerUnitId,
      PowerType.NOT_SPECIFIED,
      gridPowerConsumed,
      stagedHydrogenProduction.unitId,
      amountOfHydrogenProducedWithGridPower,
      recordedBy,
      HydrogenColor.MIX,
      hydrogenStorageUnitId,
      stagedHydrogenProduction.ownerId,
      stagedHydrogenProduction.ownerId,
      waterConsumption,
    );
    const gridPowerCreateEntities: CreateProductionEntity[] = ProductionUtils.splitGridPowerProduction(
      gridPowerCreateEntity,
      EnergySource.GRID,
    );
    createProductionEntities.push(...gridPowerCreateEntities);
    return createProductionEntities;
  }

  getStagedProductionsToSetInactive(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
  ): StagedProductionEntity[] {
    let stagedProductionsToSetInactive: StagedProductionEntity[] = [stagedHydrogenProduction];

    let remainingPowerConsuption = stagedHydrogenProduction.powerConsumed;

    for (const stagedPowerProduction of stagedPowerProductions) {
      remainingPowerConsuption = remainingPowerConsuption - stagedPowerProduction.amountProduced;
      stagedProductionsToSetInactive.push(stagedPowerProduction);
      this.logger.debug(`The staged production ${stagedPowerProduction.id} should be deactivated`);

      if (remainingPowerConsuption < 0) {
        return stagedProductionsToSetInactive;
      }
    }
    return stagedProductionsToSetInactive;
  }

  getRemainingPowerProduction(
    stagedHydrogenProduction: StagedProductionEntity,
    stagedPowerProductions: StagedProductionEntity[],
  ): StagedProductionEntity {
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
        this.logger.debug(`The remainig power of ${splittedPowerProduction.amountProduced} was persisted`);
        return splittedPowerProduction;
      }
    }
    this.logger.debug(`No split was necessary`);
    return undefined;
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
