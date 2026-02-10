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
  powerProductions: UnitFileReference[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UnitFileReference)
  hydrogenProductions: UnitFileReference[];

  @IsString()
  @IsNotEmpty()
  gridPowerProductionUnitId: string;

  constructor(powerProductions: UnitFileReference[], hydrogenProductions: UnitFileReference[], gridPowerProductionUnitId: string) {
    this.powerProductions = powerProductions;
    this.hydrogenProductions = hydrogenProductions;
    this.gridPowerProductionUnitId = gridPowerProductionUnitId;
  }
}
