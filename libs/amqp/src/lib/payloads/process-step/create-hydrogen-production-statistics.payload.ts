/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHydrogenProductionStatisticsPayload {
  @IsNotEmpty()
  month?: Date;

  @IsNotEmpty()
  unitName?: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  constructor(userId: string, month?: Date, unitName?: string) {
    this.ownerId = userId;
    this.month = month;
    this.unitName = unitName;
  }
}
