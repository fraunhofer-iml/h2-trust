/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { UnitType } from '@h2-trust/domain';
import { BaseUnitDto } from './base-unit.dto';

export class HydrogenBottlingUnitDto extends BaseUnitDto {
  override readonly unitType = UnitType.BOTTLING;

  static override fromEntity(unit: UnitEntity): HydrogenBottlingUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      unitType: UnitType.BOTTLING,
    };
  }
}
