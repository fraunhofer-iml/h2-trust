/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsBoolean, IsNotEmpty } from 'class-validator';
import { UpdateUnitStatusPayload } from '@h2-trust/contracts/payloads';

export class UnitUpdateActiveDto {
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  constructor(active: boolean) {
    this.active = active;
  }

  static toPayload(id: string, active: boolean): UpdateUnitStatusPayload {
    return new UpdateUnitStatusPayload(id, active);
  }
}
