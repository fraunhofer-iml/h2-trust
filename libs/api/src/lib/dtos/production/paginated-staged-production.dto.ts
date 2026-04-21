/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedStagedProductionEntity } from '@h2-trust/amqp';
import { StagedProductionDto } from './staged-production.dto';

export class PaginatedStagedProductionDto {
  data: StagedProductionDto[];
  totalItems: number;
  currentPage: number;

  constructor(data: StagedProductionDto[], totalItems: number, currentPage: number) {
    this.data = data;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
  }

  static fromEntity(entity: PaginatedStagedProductionEntity): PaginatedStagedProductionDto {
    return {
      data: entity.stagedProductions.map(StagedProductionDto.fromEntity),
      totalItems: entity.totalAmountOfItems,
      currentPage: entity.currentPage,
    };
  }
}
