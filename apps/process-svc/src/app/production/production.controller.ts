/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as amqp from '@h2-trust/amqp';
import { SubmitProductionProps } from '@h2-trust/amqp';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @MessagePattern(amqp.ProductionMessagePatterns.CREATE)
  async createProduction(
    @Payload() payload: { createProductionEntity: amqp.CreateProductionEntity },
  ): Promise<amqp.ProcessStepEntity[]> {
    return this.service.createProduction(payload.createProductionEntity, false);
  }

  @MessagePattern(amqp.ProductionMessagePatterns.PERIOD_MATCHING)
  async createProductionINtervalsFromCsvData(@Payload() payload: { data: amqp.ParsedFileBundles; userId: string }) {
    return this.service.matchAccountingPeriods(payload.data, payload.userId);
  }

  @MessagePattern(amqp.ProductionMessagePatterns.IMPORT)
  async saveImportedData(@Payload() payload: SubmitProductionProps) {
    return this.service.saveImportedData(payload);
  }
}
