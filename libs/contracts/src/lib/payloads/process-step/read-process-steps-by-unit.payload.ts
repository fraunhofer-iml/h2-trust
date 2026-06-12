/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReadProcessStepsByUnitPayload {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @IsNotEmpty()
  unitTypes: string[];

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  constructor(unitTypes: string[], active: boolean, ownerId: string) {
    this.unitTypes = unitTypes;
    this.active = active;
    this.ownerId = ownerId;
  }
}
