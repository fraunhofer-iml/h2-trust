/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PowerEmissionFactorEntry {
  emissionFactor: number; // g CO₂,eq/kWh
  label: string; // Human-readable name used in calculation names
}

export interface TrailerParameterEntry {
  capacityKg: number; // nominal trailer capacity in kg H2
  transportEfficiencyMJPerTonnePerKm: number; // MJ fuel / (km * tonne H2)
  gEqEmissionsOfCH4AndN2OPerKmDistancePerTonneH2: number; // g CO2,eq / (km * tonne H2)
}
