/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProcessType } from '@h2-trust/domain';

export class ProcessStepDataFilter {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'page number must start at minimum 0' })
  pageNumber?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'page size must be at lest 1' })
  pageSize?: number;

  @IsOptional()
  @IsString()
  processStepId?: string;

  @IsOptional()
  @IsEnum(ProcessType)
  processType?: ProcessType;

  constructor(pageNumber?: number, pageSize?: number, processStepId?: string, processType?: ProcessType) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.processStepId = processStepId;
    this.processType = processType;
  }
}
