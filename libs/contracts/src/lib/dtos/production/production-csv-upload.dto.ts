/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsString, IsTimeZone } from 'class-validator';
import { CsvContentType } from '@h2-trust/domain';

export class ProductionCSVUploadDto {
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  unitIds: string | string[];

  @IsEnum(CsvContentType)
  @IsNotEmpty()
  csvContentType: CsvContentType;

  @IsString()
  @IsNotEmpty()
  @IsTimeZone()
  timeZone: string;

  constructor(unitIds: string[], csvContentType: CsvContentType, timeZone: string) {
    this.unitIds = unitIds;
    this.csvContentType = csvContentType;
    this.timeZone = timeZone;
  }
}
