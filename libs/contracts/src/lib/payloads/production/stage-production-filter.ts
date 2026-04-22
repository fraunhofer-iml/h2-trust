/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { CsvContentType, StagingScope } from '@h2-trust/domain';

export class StageProductionFilter {
  @IsString()
  ownerId: string;

  @IsEnum(StagingScope)
  @IsOptional()
  stagingScope?: StagingScope;

  @IsEnum(CsvContentType)
  @IsOptional()
  type?: CsvContentType;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  to?: Date;

  constructor(owner: string, stagingScope: StagingScope, type: CsvContentType, from: Date, to: Date) {
    this.ownerId = owner;
    this.stagingScope = stagingScope;
    this.type = type;
    this.from = from;
    this.to = to;
  }
}
