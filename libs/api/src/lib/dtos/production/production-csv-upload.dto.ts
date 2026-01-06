/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class ProductionCSVUploadDto {
  @ValidateIf(o => typeof o.powerProductionUnitIds === 'string')
  @IsString()
  @IsNotEmpty()
  @ValidateIf(o => Array.isArray(o.powerProductionUnitIds))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  powerProductionUnitIds: string | string[];

  @ValidateIf(o => typeof o.powerProductionUnitIds === 'string')
  @IsString()
  @IsNotEmpty()
  @ValidateIf(o => Array.isArray(o.powerProductionUnitIds))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  hydrogenProductionUnitIds: string | string[];

  constructor() {
    this.powerProductionUnitIds = [];
    this.hydrogenProductionUnitIds = [];
  }
}
