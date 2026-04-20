/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UnitFileImport } from '../../../../../contracts/src/lib/entities';

export class StageProductionsPayload {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UnitFileImport)
  powerProductionImports: UnitFileImport[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UnitFileImport)
  hydrogenProductionImports: UnitFileImport[];

  @IsString()
  @IsNotEmpty()
  gridPowerProductionUnitId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  constructor(
    powerProductionImports: UnitFileImport[],
    hydrogenProductionImports: UnitFileImport[],
    gridPowerProductionUnitId: string,
    userId: string,
  ) {
    this.powerProductionImports = powerProductionImports;
    this.hydrogenProductionImports = hydrogenProductionImports;
    this.gridPowerProductionUnitId = gridPowerProductionUnitId;
    this.userId = userId;
  }
}
