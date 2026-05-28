/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitNestedDbType } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenProductionUnitEntity } from './hydrogen-production-unit.entity';
import { HydrogenStorageUnitEntity } from './hydrogen-storage-unit.entity';
import { PowerProductionUnitEntity } from './power-production-unit.entity';
import { ConcreteUnitEntity } from './unit.type';

export function getSpecificUnit(unit: UnitNestedDbType): ConcreteUnitEntity {
  if (unit.type === ProcessType.HYDROGEN_PRODUCTION) {
    return HydrogenProductionUnitEntity.fromNestedDatabase(unit);
  }
  if (unit.type === ProcessType.POWER_PRODUCTION) {
    return PowerProductionUnitEntity.fromNestedUnitDatabase(unit);
  }
  //TODO-LG: the process steps of the hydrogen storage unit are missing here
  //they have to be readded to calculate the filling of the storage
  if (unit.type === ProcessType.HYDROGEN_STORAGE) {
    return HydrogenStorageUnitEntity.fromNestedDatabase(unit, []);
  }
  throw new Error('Unknown unit type');
}
