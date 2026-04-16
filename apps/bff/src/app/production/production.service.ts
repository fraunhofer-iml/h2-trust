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
  CreateHydrogenProductionStatisticsPayload,
  CreateProductionsPayload,
  CsvDocumentEntity,
  FinalizeProductionsPayload,
  PaginatedProcessStepEntity,
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionDataFilter,
  ProductionMessagePatterns,
  ProductionStagingResultEntity,
  ProductionStatisticsEntity,
  ReadByIdPayload,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  StageProductionsPayload,
  UnitFileImport,
  VerifyCsvDocumentIntegrityResultEntity,
} from '@h2-trust/amqp';
import {
  AccountingPeriodMatchingResultDto,
  CreateProductionDto,
  CsvDocumentIntegrityResultDto,
  ImportSubmissionDto,
  PaginatedProductionDataDto,
  ProcessedCsvDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { HashUtil } from '@h2-trust/blockchain';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { CentralizedStorageService } from '@h2-trust/storage';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly storageService: CentralizedStorageService,
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

  async readHydrogenProductionsByOwner(
    userId: string,
    pageNumber?: number,
    pageSize?: number,
    unitName?: string,
    month?: Date,
  ): Promise<PaginatedProductionDataDto> {
    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const ownerId = userDetails.company.id;
    const payload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
      [ProcessType.POWER_PRODUCTION],
      ownerId,
      new ProductionDataFilter(pageNumber, pageSize, unitName, month),
    );
    const paginatedProcessStep: PaginatedProcessStepEntity = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_PAGINATION_BY_PREDECESSOR_TYPES_AND_OWNER, payload),
    );
    return PaginatedProductionDataDto.fromEntity(paginatedProcessStep);
  }

  async assembleHydrogenProductionStatistics(
    userId: string,
    unitName: string,
    month: Date,
  ): Promise<ProductionStatisticsDto> {
    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const ownerId = userDetails.company.id;

    const payload = new CreateHydrogenProductionStatisticsPayload(ownerId, month, unitName);
    const productionStatistics: ProductionStatisticsEntity = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.ASSEMBLE_PRODUCTION_STATISTICS, payload),
    );
    return ProductionStatisticsDto.fromEntity(productionStatistics);
  }

  async importCsvFiles(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
    userId: string,
  ) {
    const powerProductions = this.mapUnitsToFiles(
      dto.powerProductionUnitIds,
      powerProductionFiles,
      BatchType.POWER,
    );

    const hydrogenProductions = this.mapUnitsToFiles(
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

  private mapUnitsToFiles(
    unitIds: string | string[],
    files: Express.Multer.File[],
    type: BatchType,
  ): UnitFileImport[] {
    if (!files || files.length === 0) {
      throw new BadRequestException(`Missing file for ${type} production.`);
    }

    const normalizedUnitIds = Array.isArray(unitIds) ? unitIds : [unitIds];

    if (normalizedUnitIds.length < files.length) {
      throw new BadRequestException(
        `Not enough unit IDs provided for ${type} production files: expected ${files.length}, got ${normalizedUnitIds.length}.`,
      );
    }

    return files.map((file, i) => {
      const unitId = normalizedUnitIds[i];
      const hashedFileBuffer = HashUtil.hashBuffer(file.buffer);
      const encodedFileBuffer = file.buffer.toString('base64');
      return new UnitFileImport(unitId, hashedFileBuffer, encodedFileBuffer);
    });
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
      ProcessedCsvDto.fromEntity(doc, this.storageService.baseUrl, userDetails.company.name),
    );
  }

  async verifyCsvDocumentIntegrity(id: string): Promise<CsvDocumentIntegrityResultDto> {
    const verificationResult: VerifyCsvDocumentIntegrityResultEntity = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY, new ReadByIdPayload(id)),
    );

    return CsvDocumentIntegrityResultDto.fromEntity(verificationResult);
  }
}
