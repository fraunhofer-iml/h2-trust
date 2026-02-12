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
  CreateProductionsPayload,
  CsvDocumentEntity,
  FinalizeProductionsPayload,
  ProcessStepEntity,
  ProductionMessagePatterns,
  ProductionStagingResultEntity,
  ReadByIdPayload,
  StageProductionsPayload,
} from '@h2-trust/amqp';
import { ProductionCreationService } from './production-creation.service';
import { ProductionFinalizationService } from './production-finalization.service';
import { ProductionStagingService } from './production-staging.service';

@Controller()
export class ProductionController {
  constructor(
    private readonly productionCreationService: ProductionCreationService,
    private readonly productionStagingService: ProductionStagingService,
    private readonly productionFinalizationService: ProductionFinalizationService,
  ) { }

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionCreationService.createAndPersistProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.STAGE)
  async stageProductions(payload: StageProductionsPayload): Promise<ProductionStagingResultEntity> {
    return this.productionStagingService.stageProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.FINALIZE)
  async finalizeProductions(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionFinalizationService.finalizeProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.READ_CSV_DOCUMENTS_BY_COMPANY)
  async readCsvDocumentsByCompany(payload: ReadByIdPayload): Promise<CsvDocumentEntity[]> {
    return this.productionStagingService.readCsvDocumentsByCompany(payload);
  }
}
