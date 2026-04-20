/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsString } from 'class-validator';
import { BatchType } from '@h2-trust/domain';
import { type CsvContentType } from '../../types';

export class ProductionCSVUploadDto {
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  unitIds: string | string[];

  @IsIn([BatchType.POWER, BatchType.HYDROGEN])
  csvContentType: CsvContentType;

  constructor(unitIds: string[], csvContentType: CsvContentType) {
    this.unitIds = unitIds;
    this.csvContentType = csvContentType;
  }
}
