/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHydrogenProductionStatisticsPayload {
  @IsOptional()
  month?: Date;

  @IsOptional()
  unitName?: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  constructor(ownerId: string, month?: Date, unitName?: string) {
    this.ownerId = ownerId;
    this.month = month;
    this.unitName = unitName;
  }
}
