/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductionEntity, ProcessStepEntity, ProductionMessagePatterns } from '@h2-trust/amqp';
import { ProductionService } from './production.service';

@Controller()
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @MessagePattern(ProductionMessagePatterns.CREATE)
  async createProduction(
    @Payload() payload: { createProductionEntity: CreateProductionEntity },
  ): Promise<ProcessStepEntity[]> {
    return this.service.createProduction(payload.createProductionEntity);
  }
}
