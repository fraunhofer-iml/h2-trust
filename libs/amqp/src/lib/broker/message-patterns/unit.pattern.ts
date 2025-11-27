/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UnitMessagePatterns {
  READ = 'unit.read',
  READ_MANY = 'unit.read-many',
  READ_POWER_PRODUCTION_UNITS = 'unit.read-power-production',
  READ_POWER_PRODUCTION_UNITS_BY_IDS = 'unit.read-power-production-by-ids',
  READ_HYDROGEN_PRODUCTION_UNITS = 'unit.read-hydrogen-production',
  READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS = 'unit.read-hydrogen-production-by-ids',
  READ_HYDROGEN_STORAGE_UNITS = 'unit.read-hydrogen-storage',
  READ_POWER_PRODUCTION_TYPES = 'unit.read-power-production-types',
  CREATE_POWER_PRODUCTION_UNIT = 'unit.create-power-production',
  CREATE_HYDROGEN_PRODUCTION_UNIT = 'unit.create-hydrogen-production',
  CREATE_HYDROGEN_STORAGE_UNIT = 'unit.create-hydrogen-storage',
}
