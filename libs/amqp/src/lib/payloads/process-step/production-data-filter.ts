/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsDate, IsNumber, IsString, Min } from 'class-validator';

export class ProductionDataFilter {
  @IsNumber()
  @Min(0, { message: 'page number must start at minimum 0' })
  pageNumber: number;

  @IsNumber()
  @Min(1, { message: 'page size must be at lest 1' })
  pageSize: number;

  @IsString()
  hydrogenProductionUnitName?: string;

  @IsDate()
  period?: Date;

  constructor(pageNumber: number, pageSize: number, hydrogenProductionUnitName?: string, period?: Date) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.hydrogenProductionUnitName = hydrogenProductionUnitName;
    this.period = period;
  }
}
