/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BatchType } from '@h2-trust/domain';

export class UnitFileReference {
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsEnum(BatchType)
  @IsNotEmpty()
  productionType: BatchType;

  constructor(unitId: string, fileName: string, productionType: BatchType) {
    this.unitId = unitId;
    this.fileName = fileName;
    this.productionType = productionType;
  }
}
