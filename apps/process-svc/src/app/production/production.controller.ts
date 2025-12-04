/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductionEntity,
  ParsedFileBundles,
  ProcessStepEntity,
  ProductionMessagePatterns,
  SubmitProductionProps,
} from '@h2-trust/amqp';
import { ProductionImportService } from './production-import.service';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(
    private readonly service: ProductionService,
    private readonly productionImportService: ProductionImportService,
  ) { }

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProduction(
    @Payload() payload: { createProductionEntity: CreateProductionEntity },
  ): Promise<ProcessStepEntity[]> {
    return this.service.createProduction(payload.createProductionEntity);
  }

  @MessagePattern(ProductionMessagePatterns.STAGE)
  async stageProductions(@Payload() payload: { data: ParsedFileBundles; userId: string }) {
    return this.productionImportService.stageProductions(payload.data, payload.userId);
  }

  @MessagePattern(ProductionMessagePatterns.FINALIZE)
  async finalizeStagedProductions(@Payload() payload: SubmitProductionProps) {
    return this.productionImportService.finalizeStagedProductions(payload);
  }
}
