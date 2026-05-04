/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CalculationTopic,
  CsvContentType,
  CsvDocumentIntegrityStatus,
  EnergySource,
  FuelType,
  GridLevel,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  PowerProductionType,
  PowerPurchaseAgreementStatus,
  PowerType,
  RfnboType,
  UnitType,
} from '@h2-trust/domain';
import {
  getCalculationTopic,
  getCsvContentType,
  getCsvDocumentIntegrityStatus,
  getEnergySource,
  getFuelType,
  getGridLevel,
  getHydrogenProductionMethod,
  getHydrogenProductionTechnology,
  getHydrogenStorageType,
  getPowerProductionType,
  getPowerType,
  getPPaStatus,
  getRfnboType,
  getUnitType,
} from '@h2-trust/strings';

export const ENUM_LABEL_RESOLVERS = {
  powerProductionType: (value: PowerProductionType) => getPowerProductionType(value),
  gridLevel: (value: GridLevel) => getGridLevel(value),
  hydrogenProductionMethod: (value: HydrogenProductionMethod) => getHydrogenProductionMethod(value),
  hydrogenProductionTechnology: (value: HydrogenProductionTechnology) => getHydrogenProductionTechnology(value),
  hydrogenStorageType: (value: HydrogenStorageType) => getHydrogenStorageType(value),
  fuelType: (value: FuelType) => getFuelType(value),
  energySource: (value: EnergySource) => getEnergySource(value),
  csvDocumentIntegrityStatus: (value: CsvDocumentIntegrityStatus) => getCsvDocumentIntegrityStatus(value),
  unitType: (value: UnitType) => getUnitType(value),
  calculationTopic: (value: CalculationTopic) => getCalculationTopic(value),
  rfnboType: (value: RfnboType) => getRfnboType(value),
  ppaStatus: (value: PowerPurchaseAgreementStatus) => getPPaStatus(value),
  powerType: (value: PowerType) => getPowerType(value),
  csvContentType: (value: CsvContentType) => getCsvContentType(value),
} as const;
