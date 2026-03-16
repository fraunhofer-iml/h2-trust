/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedProcessStepEntity } from '@h2-trust/amqp';
import { ProductionOverviewDto } from './production-overview.dto';

export class PaginatedProductionDataDto {
  data: ProductionOverviewDto[];
  totalItems: number;
  currentPage: number;

  constructor(data: ProductionOverviewDto[], totalItems: number, currentPage: number) {
    this.data = data;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
  }

  static fromEntity(entity: PaginatedProcessStepEntity): PaginatedProductionDataDto {
    return {
      data: entity.processSteps.map(ProductionOverviewDto.fromEntity),
      totalItems: entity.totalAmountOfItems,
      currentPage: entity.currentPage,
    };
  }
}
