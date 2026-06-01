/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { UnitType } from '@h2-trust/domain';

export class ReadByOwnerIdAndTypePayload {
  @IsString()
  @IsNotEmpty()
  id: string;

  type?: UnitType;

  constructor(id: string, type: UnitType) {
    this.id = id;
    this.type = type;
  }
}
