/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BaseUnitFlatDbType, BaseUnitNestedDbType } from '@h2-trust/database';
import { BrokerException } from '../../broker';
import { HydrogenProductionUnitEntity } from './hydrogen-production-unit.entity';
import { HydrogenStorageUnitEntity } from './hydrogen-storage-unit.entity';
import { PowerProductionUnitEntity } from './power-production-unit.entity';

export class EntityUtils {
  static getSpecificUnit(
    unit: BaseUnitNestedDbType,
  ): HydrogenProductionUnitEntity | PowerProductionUnitEntity | HydrogenStorageUnitEntity {
    if (unit.hydrogenProductionUnit) {
      return HydrogenProductionUnitEntity.fromNestedDatabase(unit);
    }
    if (unit.powerProductionUnit) {
      return PowerProductionUnitEntity.fromNestedDatabase(unit);
    }
    if (unit.hydrogenStorageUnit) {
      return HydrogenStorageUnitEntity.fromNestedDatabase(unit);
    }
    throw new BrokerException('', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static getSpecificUnitForFlatBaseUnit(
    unit: BaseUnitFlatDbType,
  ): HydrogenProductionUnitEntity | PowerProductionUnitEntity | HydrogenStorageUnitEntity {
    if (unit.hydrogenProductionUnit) {
      return HydrogenProductionUnitEntity.fromFlatDatabase(unit);
    }
    if (unit.powerProductionUnit) {
      return PowerProductionUnitEntity.fromFlatDatabase(unit);
    }
    if (unit.hydrogenStorageUnit) {
      return HydrogenStorageUnitEntity.fromFlatDatabase(unit);
    }
    throw new BrokerException('', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
