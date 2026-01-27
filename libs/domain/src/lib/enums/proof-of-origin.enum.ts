/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO-MP: this enum should NOT contain any display strings and will be fixed in DUHGW-322
// However, we cannot move it right now due to breaking changes:
// The first parameter of the ClassificationAssembler methods require a generic string enum.
// On the one hand it can be an actual classification or section name (e.g. "Power Supply").
// On the other hand it can be an EnergySource or an HydrogenColor or something else...
export enum ProofOfOrigin {
  HYDROGEN_TRANSPORTATION_SECTION = 'Hydrogen Transportation',
  HYDROGEN_BOTTLING_SECTION = 'Hydrogen Bottling',
  HYDROGEN_PRODUCTION_SECTION = 'Hydrogen Production',
  HYDROGEN_STORAGE_SECTION = 'Hydrogen Storage',
  POWER_SUPPLY_CLASSIFICATION = 'Power Supply',
  WATER_SUPPLY_CLASSIFICATION = 'Water Supply',
  HYDROGEN_PRODUCTION_TYPE = 'Electrolysis',
}
