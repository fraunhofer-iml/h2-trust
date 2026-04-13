/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BaseUnitNestedDbType } from '@h2-trust/database';
import { BrokerException } from '../../broker';
import { ConcreteUnitEntity } from '../../types';
import { HydrogenProductionUnitEntity } from './hydrogen-production-unit.entity';
import { HydrogenStorageUnitEntity } from './hydrogen-storage-unit.entity';
import { PowerProductionUnitEntity } from './power-production-unit.entity';

export function getSpecificUnit(unit: BaseUnitNestedDbType): ConcreteUnitEntity {
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
