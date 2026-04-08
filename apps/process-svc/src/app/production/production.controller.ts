/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateProductionsPayload,
  CsvDocumentEntity,
  FinalizeProductionsPayload,
  ProcessStepEntity,
  ProductionMessagePatterns,
  ProductionStagingResultEntity,
  ProductionStatisticsEntity,
  ReadByIdPayload,
  StageProductionsPayload,
  VerifyCsvDocumentIntegrityResultEntity,
} from '@h2-trust/amqp';
import { CsvDocumentService } from './csv-document.service';
import { ProductionStagingService } from './production-staging.service';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(
    private readonly csvDocumentService: CsvDocumentService,
    private readonly productionStagingService: ProductionStagingService,
    private readonly productionService: ProductionService,
  ) {}

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionService.createProductions(payload);
  }

    @MessagePattern(ProductionMessagePatterns.CREATE_PRODUCTION_STATISTICS)
    async createProductionStatistics(
      payload: CreateHydrogenProductionStatisticsPayload,
    ): Promise<ProductionStatisticsEntity> {
      return this.productionService.createProductionStatistics(payload);
    }

  @MessagePattern(ProductionMessagePatterns.STAGE)
  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    return this.productionStagingService.stageProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.FINALIZE)
  async finalizeProductions(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionService.finalizeProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.READ_CSV_DOCUMENTS_BY_COMPANY)
  async readCsvDocumentsByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.csvDocumentService.findByCompany(payload);
  }

  @MessagePattern(ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY)
  async verifyCsvDocumentIntegrity(payload: ReadByIdPayload): Promise<VerifyCsvDocumentIntegrityResultEntity> {
    return this.csvDocumentService.verifyCsvDocumentIntegrity(payload);
  }
}
