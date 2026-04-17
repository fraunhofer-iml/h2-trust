/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PowerProductionType } from '@h2-trust/domain';

export class PpaRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsEnum(PowerProductionType)
  powerProductionType: PowerProductionType;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validFrom: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validTo: Date;

  constructor(companyId: string, powerProductionType: PowerProductionType, validFrom: Date, validTo: Date) {
    this.companyId = companyId;
    this.powerProductionType = powerProductionType;
    this.validFrom = validFrom;
    this.validTo = validTo;
  }
}
