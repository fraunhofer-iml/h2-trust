/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchType,
  CalculationTopic,
  CsvContentType,
  CsvDocumentIntegrityStatus,
  FuelType,
  GridLevel,
  HydrogenProductionTechnology,
  HydrogenProductionType,
  HydrogenStorageType,
  PowerProductionType,
  PowerPurchaseAgreementStatus,
  PowerType,
  ProcessType,
  RfnboType,
  TransportType,
  UnitType,
} from '@h2-trust/domain';
import {
  getBatchType,
  getCalculationTopic,
  getCsvContentType,
  getCsvDocumentIntegrityStatus,
  getFuelType,
  getGridLevel,
  getHydrogenProductionTechnology,
  getHydrogenProductionType,
  getHydrogenStorageType,
  getPowerProductionType,
  getPowerType,
  getPPaStatus,
  getProcessType,
  getRfnboType,
  getTransportType,
  getUnitType,
} from '@h2-trust/strings';

export const ENUM_LABEL_RESOLVERS = {
  powerProductionType: (value: PowerProductionType) => getPowerProductionType(value),
  gridLevel: (value: GridLevel) => getGridLevel(value),
  hydrogenProductionType: (value: HydrogenProductionType) => getHydrogenProductionType(value),
  hydrogenProductionTechnology: (value: HydrogenProductionTechnology) => getHydrogenProductionTechnology(value),
  hydrogenStorageType: (value: HydrogenStorageType) => getHydrogenStorageType(value),
  fuelType: (value: FuelType) => getFuelType(value),
  transportType: (value: TransportType) => getTransportType(value),
  csvDocumentIntegrityStatus: (value: CsvDocumentIntegrityStatus) => getCsvDocumentIntegrityStatus(value),
  unitType: (value: UnitType) => getUnitType(value),
  calculationTopic: (value: CalculationTopic) => getCalculationTopic(value),
  rfnboType: (value: RfnboType) => getRfnboType(value),
  ppaStatus: (value: PowerPurchaseAgreementStatus) => getPPaStatus(value),
  powerType: (value: PowerType) => getPowerType(value),
  csvContentType: (value: CsvContentType) => getCsvContentType(value),
  batchType: (value: BatchType) => getBatchType(value),
  processType: (value: ProcessType) => getProcessType(value),
} as const;

export type EnumLabelKey = keyof typeof ENUM_LABEL_RESOLVERS;
