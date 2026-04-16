/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UnitFileReference } from '../../entities';

export class StageProductionsPayload {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UnitFileReference)
  stageProductions: UnitFileReference[];
  @IsString()
  @IsNotEmpty()
  gridPowerProductionUnitId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  constructor(powerProductions: UnitFileReference[], userId: string) {
    this.stageProductions = powerProductions;
    this.userId = userId;
  }
}
