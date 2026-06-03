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
  READ_BY_OWNER_ID_AND_TYPE = 'unit.read-by-owner-id-and-type',

  CREATE_POWER_PRODUCTION = 'unit.create-power-production',
  CREATE_HYDROGEN_PRODUCTION = 'unit.create-hydrogen-production',
  CREATE_HYDROGEN_STORAGE = 'unit.create-hydrogen-storage',
  CREATE_HYDROGEN_TRANSPORT = 'unit.create-hydrogen-transport',
  CREATE_HYDROGEN_COMPRESSOR = 'unit.create-hydrongen-compressor',
  CREATE_HYDROGEN_BOTTLING = 'unit.create-hydrongen-bottling',
  CREATE_HYDROGEN_END_USE = 'unit.create-hydrongen-end-use',

  UPDATE_HYDROGEN_PRODUCTION = 'unit.update-hydrogen-production',
  UPDATE_POWER_PRODUCTION = 'unit.update-power-production',
  UPDATE_HYDROGEN_STORAGE = 'unit.update-hydrogen-storage',
  UPDATE_HYDROGEN_TRANSPORT = 'unit.update-hydrogen-transport',
  UPDATE_HYDROGEN_COMPRESSOR = 'unit.update-hydrogen-compressor',
  UPDATE_HYDROGEN_BOTTLING = 'unit.update-hydrogen-bottling',
  UPDATE_HYDROGEN_END_USE = 'unit.update-hydrogen-end-use',

  UPDATE_STATUS = 'unit.update-status',
}
