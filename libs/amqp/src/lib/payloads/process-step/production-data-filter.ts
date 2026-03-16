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
  unitName?: string;

  @IsDate()
  month?: Date;

  constructor(pageNumber: number, pageSize: number, unitName?: string, month?: Date) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.unitName = unitName;
    this.month = month;
  }
}
