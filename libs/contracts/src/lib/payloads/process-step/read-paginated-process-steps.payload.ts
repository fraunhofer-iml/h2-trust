/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ProcessStepDataFilter } from './process-step-data-filter';

export class ReadPaginatedProcessStepsPayload {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProcessStepDataFilter)
  filter: ProcessStepDataFilter;

  constructor(ownerId: string, filter: ProcessStepDataFilter) {
    this.ownerId = ownerId;
    this.filter = filter;
  }
}
