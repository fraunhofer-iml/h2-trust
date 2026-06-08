/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { UnitType } from '@h2-trust/domain';
import { HydrogenBottlingOverviewDto } from './hydrogen-bottling-overview.dto';
import { HydrogenBottlingUnitDto } from './hydrogen-bottling-unit.dto';
import { HydrogenCompressorOverviewDto } from './hydrogen-compressor-overview.dto';
import { HydrogenCompressorUnitDto } from './hydrogen-compressor-unit.dto';
import { HydrogenEndUseOverviewDto } from './hydrogen-end-use-overview.dto';
import { HydrogenEndUseUnitDto } from './hydrogen-end-use-unit.dto';
import { HydrogenProductionOverviewDto } from './hydrogen-production-overview.dto';
import { HydrogenProductionUnitDto } from './hydrogen-production-unit.dto';
import { HydrogenStorageOverviewDto } from './hydrogen-storage-overview.dto';
import { HydrogenStorageUnitDto } from './hydrogen-storage-unit.dto';
import { HydrogenTransportOverviewDto } from './hydrogen-transport-overview.dto';
import { HydrogenTransportUnitDto } from './hydrogen-transport-unit.dto';
import { PowerProductionOverviewDto } from './power-production-overview.dto';
import { PowerProductionUnitDto } from './power-production-unit.dto';
import { UnitDto, UnitOverviewDto } from './unit-overview.type';

export function getSpecificUnit(unit: UnitEntity): UnitDto {
  switch (unit.unitType) {
    case UnitType.HYDROGEN_PRODUCTION:
      return HydrogenProductionUnitDto.fromEntity(unit);
    case UnitType.POWER_PRODUCTION:
      return PowerProductionUnitDto.fromEntity(unit);
    case UnitType.HYDROGEN_STORAGE:
      return HydrogenStorageUnitDto.fromEntity(unit);
    case UnitType.TRANSPORTATION:
      return HydrogenTransportUnitDto.fromEntity(unit);
    case UnitType.BOTTLING:
      return HydrogenBottlingUnitDto.fromEntity(unit);
    case UnitType.COMPRESSION:
      return HydrogenCompressorUnitDto.fromEntity(unit);
    case UnitType.END_USE:
      return HydrogenEndUseUnitDto.fromEntity(unit);
    default:
      throw new Error(`Unknown unit type: ${unit.unitType}`);
  }
}

export function getSpecificUnitOverview(unit: UnitEntity): UnitOverviewDto {
  switch (unit.unitType) {
    case UnitType.HYDROGEN_PRODUCTION:
      return HydrogenProductionOverviewDto.fromEntity(unit);
    case UnitType.POWER_PRODUCTION:
      return PowerProductionOverviewDto.fromEntity(unit);
    case UnitType.HYDROGEN_STORAGE:
      return HydrogenStorageOverviewDto.fromEntity(unit);
    case UnitType.TRANSPORTATION:
      return HydrogenTransportOverviewDto.fromEntity(unit);
    case UnitType.BOTTLING:
      return HydrogenBottlingOverviewDto.fromEntity(unit);
    case UnitType.COMPRESSION:
      return HydrogenCompressorOverviewDto.fromEntity(unit);
    case UnitType.END_USE:
      return HydrogenEndUseOverviewDto.fromEntity(unit);
    default:
      throw new Error(`Unknown unit type: ${unit.unitType}`);
  }
}
