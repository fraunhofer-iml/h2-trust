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
  FinalizeStagedProductionsPayload,
  ParsedProductionMatchingResultEntity,
  ProcessStepEntity,
  ProductionMessagePatterns,
  StageProductionsPayload,
} from '@h2-trust/amqp';
import { ProductionCreationService } from './production-creation.service';
import { ProductionImportService } from './production-import.service';

@Controller()
export class ProductionController {
  constructor(
    private readonly productionCreationService: ProductionCreationService,
    private readonly productionImportService: ProductionImportService,
  ) {}

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionCreationService.createProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.STAGE)
  async stageProductions(payload: StageProductionsPayload): Promise<ParsedProductionMatchingResultEntity> {
    return this.productionImportService.stageProductions(payload);
  }

  @MessagePattern(ProductionMessagePatterns.FINALIZE)
  async finalizeStagedProductions(payload: FinalizeStagedProductionsPayload): Promise<ProcessStepEntity[]> {
    return this.productionImportService.finalizeStagedProductions(payload);
  }
}
