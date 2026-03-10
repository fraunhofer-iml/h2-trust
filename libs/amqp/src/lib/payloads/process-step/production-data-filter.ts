/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */
export class ProductionDataFilter {
  pageNumber?: number;
  pageSize?: number;
  hydrogenProductionUnitId?: string;
  period?: Date;

  constructor(pageNumber?: number, pageSize?: number, hydrogenProductionUnitId?: string, period?: Date) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.period = period;
  }
}
