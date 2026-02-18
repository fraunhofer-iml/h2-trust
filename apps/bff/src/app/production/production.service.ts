/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateProductionsPayload,
  CsvDocumentEntity,
  FinalizeProductionsPayload,
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  ProductionStagingResultEntity,
  ReadByIdPayload,
  ReadProcessStepsByPredecessorTypesAndOwnerPayload,
  StageProductionsPayload,
  UnitFileReference,
} from '@h2-trust/amqp';
import {
  AccountingPeriodMatchingResultDto,
  CreateProductionDto,
  ImportSubmissionDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  UserDetailsDto,
  VerifyCsvDocumentIntegrityDto,
} from '@h2-trust/api';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly storageService: StorageService,
    private readonly userService: UserService,
  ) { }

  async createProductions(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload = new CreateProductionsPayload(
      dto.productionStartedAt,
      dto.productionEndedAt,
      dto.powerProductionUnitId,
      dto.powerAmountKwh,
      dto.hydrogenProductionUnitId,
      dto.hydrogenAmountKg,
      userId,
      dto.hydrogenStorageUnitId,
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, payload),
    );

    return processSteps
      .filter((processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  async readHydrogenProductionsByOwner(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const ownerId = userDetails.company.id;

    const payload = new ReadProcessStepsByPredecessorTypesAndOwnerPayload([ProcessType.POWER_PRODUCTION], ownerId);

    const productions: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_PREDECESSOR_TYPES_AND_OWNER, payload),
    );
    return productions.map(ProductionOverviewDto.fromEntity);
  }

  async importCsvFiles(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
    userId: string,
  ) {
    const powerProductions = await this.uploadAndMapFilesToUnits(
      dto.powerProductionUnitIds,
      powerProductionFiles,
      BatchType.POWER,
    );

    const hydrogenProductions = await this.uploadAndMapFilesToUnits(
      dto.hydrogenProductionUnitIds,
      hydrogenProductionFiles,
      BatchType.HYDROGEN,
    );

    const gridPowerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(
        PowerAccessApprovalPatterns.READ_APPROVED_GRID_POWER_PRODUCTION_UNIT_BY_USER_ID,
        new ReadByIdPayload(userId),
      ),
    );

    const payload = new StageProductionsPayload(
      powerProductions,
      hydrogenProductions,
      gridPowerProductionUnit.id,
      userId,
    );
    const matchingResult = await firstValueFrom(
      this.processSvc.send<ProductionStagingResultEntity>(ProductionMessagePatterns.STAGE, payload),
    );
    return AccountingPeriodMatchingResultDto.fromEntity(matchingResult);
  }

  private async uploadAndMapFilesToUnits(
    unitIds: string | string[],
    files: Express.Multer.File[],
    type: BatchType,
  ): Promise<UnitFileReference[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException(`Missing file for ${type} production.`);
    }

    const normalizedUnitIds = Array.isArray(unitIds) ? unitIds : [unitIds];

    if (normalizedUnitIds.length < files.length) {
      throw new BadRequestException(
        `Not enough unit IDs provided for ${type} production files: expected ${files.length}, got ${normalizedUnitIds.length}.`,
      );
    }

    return Promise.all(
      files.map(async (file, i) => {
        const fileName = await this.storageService.uploadFileWithRandomFileName(file.originalname, file.buffer);
        return new UnitFileReference(normalizedUnitIds[i], fileName);
      }),
    );
  }

  async submitCsvData(dto: ImportSubmissionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload: FinalizeProductionsPayload = new FinalizeProductionsPayload(userId, dto.storageUnitId, dto.importId);
    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send<ProcessStepEntity[]>(ProductionMessagePatterns.FINALIZE, payload),
    );
    return processSteps.map(ProductionOverviewDto.fromEntity);
  }

  async readCsvDocumentsByCompany(userId: string): Promise<ProcessedCsvDto[]> {
    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);

    const csvDocuments: CsvDocumentEntity[] = await firstValueFrom(
      this.processSvc.send(
        ProductionMessagePatterns.READ_CSV_DOCUMENTS_BY_COMPANY,
        new ReadByIdPayload(userDetails.company.id),
      ),
    );

    return csvDocuments.map((doc) =>
      ProcessedCsvDto.fromEntity(doc, this.storageService.minioUrl, userDetails.company.name),
    );
  }

  async verifyCsvDocumentIntegrity(dto: VerifyCsvDocumentIntegrityDto): Promise<boolean> {
    const verified: boolean = await firstValueFrom(
      this.processSvc.send(
        ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY,
        new ReadByIdPayload(dto.documentId),
      )
    );

    return verified;
  }
}
