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
  HydrogenColor,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  PowerProductionType,
  PowerPurchaseAgreementStatus,
  PowerType,
  RfnboType,
  UnitType,
} from '@h2-trust/domain';
import { EnumLabelMapper } from '@h2-trust/strings';

export const ENUM_LABEL_RESOLVERS = {
  powerProductionType: (value: PowerProductionType) => EnumLabelMapper.getPowerProductionType(value),
  gridLevel: (value: GridLevel) => EnumLabelMapper.getGridLevel(value),
  hydrogenProductionMethod: (value: HydrogenProductionMethod) => EnumLabelMapper.getHydrogenProductionMethod(value),
  hydrogenProductionTechnology: (value: HydrogenProductionTechnology) =>
    EnumLabelMapper.getHydrogenProductionTechnology(value),
  hydrogenStorageType: (value: HydrogenStorageType) => EnumLabelMapper.getHydrogenStorageType(value),
  fuelType: (value: FuelType) => EnumLabelMapper.getFuelType(value),
  energySource: (value: EnergySource) => EnumLabelMapper.getEnergySource(value),
  hydrogenColor: (value: HydrogenColor) => EnumLabelMapper.getHydrogenColor(value),
  csvDocumentIntegrityStatus: (value: CsvDocumentIntegrityStatus) =>
    EnumLabelMapper.getCsvDocumentIntegrityStatus(value),
  unitType: (value: UnitType) => EnumLabelMapper.getUnitType(value),
  calculationTopic: (value: CalculationTopic) => EnumLabelMapper.getCalculationTopic(value),
  rfnboType: (value: RfnboType) => EnumLabelMapper.getRfnboType(value),
  ppaStatus: (value: PowerPurchaseAgreementStatus) => EnumLabelMapper.getPPaStatus(value),
  powerType: (value: PowerType) => EnumLabelMapper.getPowerType(value),
  csvContentType: (value: CsvContentType) => EnumLabelMapper.getCsvContentType(value),
} as const;
