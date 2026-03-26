/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from './process-step.entity';

export class PaginatedProcessStepEntity {
  processSteps: ProcessStepEntity[];
  currentPage: number;
  pageSize: number;
  totalAmountOfItems: number;

  constructor(processSteps: ProcessStepEntity[], currentPage: number, pageSize: number, totalAmountOfItems: number) {
    this.processSteps = processSteps;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.totalAmountOfItems = totalAmountOfItems;
  }
}
