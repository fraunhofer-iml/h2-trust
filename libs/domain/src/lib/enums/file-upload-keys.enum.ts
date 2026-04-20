/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO-MP: this enum will be moved to libs/api when implementing DUHGW-344
// We cannot move it now because building frontend would fail due to polyfill issues.
export enum FileUploadKeys {
  POWER_PRODUCTION = 'powerProductionFiles',
  HYDROGEN_PRODUCTION = 'hydrogenProductionFiles',
}
