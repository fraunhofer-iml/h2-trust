/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UnitMessagePatterns {
  READ_BY_ID = 'unit.read-by-id',
  READ_MANY_BY_IDS = 'unit.read-many-by-ids',
  READ_POWER_PRODUCTION = 'unit.read-power-production',
  READ_POWER_PRODUCTION_BY_IDS = 'unit.read-power-production-by-ids',
  READ_HYDROGEN_PRODUCTION = 'unit.read-hydrogen-production',
  READ_HYDROGEN_PRODUCTION_BY_IDS = 'unit.read-hydrogen-production-by-ids',
  READ_HYDROGEN_STORAGE = 'unit.read-hydrogen-storage',
  READ_POWER_PRODUCTION_TYPES = 'unit.read-power-production-types',
  CREATE_POWER_PRODUCTION = 'unit.create-power-production',
  CREATE_HYDROGEN_PRODUCTION = 'unit.create-hydrogen-production',
  CREATE_HYDROGEN_STORAGE = 'unit.create-hydrogen-storage',
  UPDATE_HYDROGEN_PRODUCTION = 'unit.update-hydrogen-production',
  UPDATE_POWER_PRODUCTION = 'unit.update-power-production',
  UPDATE_HYDROGEN_STORAGE = 'unit.update-hydrogen-storage',
  UPDATE_STATUS = 'unit.update-status',
}
