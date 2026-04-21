/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity } from './staged-production.entity';

export class PaginatedStagedProductionEntity {
  stagedProductions: StagedProductionEntity[];
  currentPage: number;
  pageSize: number;
  totalAmountOfItems: number;

  constructor(
    stagedProductions: StagedProductionEntity[],
    currentPage: number,
    pageSize: number,
    totalAmountOfItems: number,
  ) {
    this.stagedProductions = stagedProductions;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.totalAmountOfItems = totalAmountOfItems;
  }
}
