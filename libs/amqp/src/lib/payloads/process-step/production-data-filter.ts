/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsDate, IsNumber, IsString } from 'class-validator';

export class ProductionDataFilter {
  @IsNumber()
  pageNumber?: number;

  @IsNumber()
  pageSize?: number;

  @IsString()
  hydrogenProductionUnitId?: string;

  @IsDate()
  period?: Date;

  constructor(pageNumber?: number, pageSize?: number, hydrogenProductionUnitId?: string, period?: Date) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.period = period;
  }
}
