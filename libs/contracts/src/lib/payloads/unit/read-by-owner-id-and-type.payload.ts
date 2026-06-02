/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UnitType } from '@h2-trust/domain';

export class ReadByOwnerIdAndTypePayload {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  constructor(id: string, unitType: UnitType) {
    this.id = id;
    this.unitType = unitType;
  }
}
