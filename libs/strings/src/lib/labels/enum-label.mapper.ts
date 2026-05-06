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
  EnergySource,
  FuelType,
  GridLevel,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  MeasurementUnit,
  PowerProductionType,
  PowerPurchaseAgreementStatus,
  PowerType,
  ProcessType,
  RfnboType,
  UnitType,
} from '@h2-trust/domain';

const POWER_PRODUCTION_TYPE_LABELS: Record<PowerProductionType, string> = {
  [PowerProductionType.GRID]: 'Grid',
  [PowerProductionType.HYDRO_POWER_PLANT]: 'Hydro Power Plant',
  [PowerProductionType.PHOTOVOLTAIC_SYSTEM]: 'Photovoltaic System',
  [PowerProductionType.WIND_TURBINE]: 'Wind Turbine',
};

const GRID_LEVEL_LABELS: Record<GridLevel, string> = {
  [GridLevel.EXTRA_HIGH_VOLTAGE]: 'Extra High Voltage',
  [GridLevel.HIGH_VOLTAGE]: 'High Voltage',
  [GridLevel.MEDIUM_VOLTAGE]: 'Medium Voltage',
  [GridLevel.LOW_VOLTAGE]: 'Low Voltage',
};

const HYDROGEN_PRODUCTION_METHOD_LABELS: Record<HydrogenProductionMethod, string> = {
  [HydrogenProductionMethod.ELECTROLYSIS]: 'Electrolysis',
};

const HYDROGEN_PRODUCTION_TECHNOLOGY_LABELS: Record<HydrogenProductionTechnology, string> = {
  [HydrogenProductionTechnology.AEL]: 'AEL',
  [HydrogenProductionTechnology.AEM]: 'AEM',
  [HydrogenProductionTechnology.PEM]: 'PEM',
  [HydrogenProductionTechnology.SOEC]: 'SOEC',
};

const HYDROGEN_STORAGE_TYPE_LABELS: Record<HydrogenStorageType, string> = {
  [HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN]: 'Compressed Gaseous Hydrogen',
  [HydrogenStorageType.LIQUID_HYDROGEN]: 'Liquid Hydrogen',
};

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FuelType.DIESEL]: 'Diesel',
};

const ENERGY_SOURCE_LABELS: Record<EnergySource, string> = {
  [EnergySource.GRID]: 'Grid',
  [EnergySource.HYDRO_POWER]: 'Hydro Power Plant',
  [EnergySource.SOLAR_ENERGY]: 'Photovoltaic System',
  [EnergySource.WIND_ENERGY]: 'Wind Turbine',
};

const BATCH_TYPE_MEASUREMENT_UNIT: Record<BatchType, string> = {
  [BatchType.HYDROGEN]: MeasurementUnit.KG,
  [BatchType.POWER]: MeasurementUnit.KWH,
  [BatchType.WATER]: MeasurementUnit.L,
};

const CSV_DOCUMENT_INTEGRITY_STATUS_LABELS: Record<CsvDocumentIntegrityStatus, string> = {
  [CsvDocumentIntegrityStatus.VERIFIED]: 'Verified',
  [CsvDocumentIntegrityStatus.MISMATCH]: 'Mismatch',
  [CsvDocumentIntegrityStatus.FAILED]: 'Failed',
};

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  [UnitType.POWER_PRODUCTION]: 'Power Production',
  [UnitType.HYDROGEN_PRODUCTION]: 'Hydrogen Production',
  [UnitType.HYDROGEN_STORAGE]: 'Hydrogen Storage',
};

const CALCULATION_TOPIC_LABELS: Record<CalculationTopic, string> = {
  [CalculationTopic.HYDROGEN_BOTTLING]: 'Bottling',
  [CalculationTopic.POWER_SUPPLY]: 'Power Supply',
  [CalculationTopic.WATER_SUPPLY]: 'Water Supply',
  [CalculationTopic.HYDROGEN_STORAGE]: 'Hydrogen Storage',
  [CalculationTopic.HYDROGEN_TRANSPORTATION]: 'Transportation',
};

const RFNBO_TYPE_LABELS: Record<RfnboType, string> = {
  [RfnboType.RFNBO_READY]: 'RFNBO Ready',
  [RfnboType.NON_CERTIFIABLE]: 'Non Certifiable',
  [RfnboType.NOT_SPECIFIED]: 'Not Specified',
};

const PPA_STATUS_LABELS: Record<PowerPurchaseAgreementStatus, string> = {
  [PowerPurchaseAgreementStatus.REJECTED]: 'Rejected',
  [PowerPurchaseAgreementStatus.PENDING]: 'Pending',
  [PowerPurchaseAgreementStatus.APPROVED]: 'Approved',
};

const POWER_TYPE_LABELS: Record<PowerType, string> = {
  [PowerType.RENEWABLE]: 'Renewable',
  [PowerType.PARTLY_RENEWABLE]: 'Partly Renewable',
  [PowerType.NON_RENEWABLE]: 'Non Renewable',
  [PowerType.NOT_SPECIFIED]: 'Not Specified',
};

const CSV_CONTENT_TYPE_LABELS: Record<CsvContentType, string> = {
  [CsvContentType.POWER]: 'Power',
  [CsvContentType.HYDROGEN]: 'Hydrogen',
};

const BATCH_TYPE_LABELS: Record<BatchType, string> = {
  [BatchType.POWER]: 'Power',
  [BatchType.HYDROGEN]: 'Hydrogen',
  [BatchType.WATER]: 'Water',
};

const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  [ProcessType.HYDROGEN_BOTTLING]: 'Hydrogen Bottling',
  [ProcessType.HYDROGEN_PRODUCTION]: 'Hydrogen Production',
  [ProcessType.HYDROGEN_TRANSPORTATION]: 'Hydrogen Transportation',
  [ProcessType.POWER_PRODUCTION]: 'Power Production',
  [ProcessType.WATER_CONSUMPTION]: 'Water Consumption',
};

export function getPowerProductionType(value: PowerProductionType): string {
  return getLabel(value, POWER_PRODUCTION_TYPE_LABELS);
}

export function getGridLevel(value: GridLevel): string {
  return getLabel(value, GRID_LEVEL_LABELS);
}

export function getHydrogenProductionMethod(value: HydrogenProductionMethod): string {
  return getLabel(value, HYDROGEN_PRODUCTION_METHOD_LABELS);
}

export function getHydrogenProductionTechnology(value: HydrogenProductionTechnology): string {
  return getLabel(value, HYDROGEN_PRODUCTION_TECHNOLOGY_LABELS);
}

export function getHydrogenStorageType(value: HydrogenStorageType): string {
  return getLabel(value, HYDROGEN_STORAGE_TYPE_LABELS);
}

export function getFuelType(value: FuelType): string {
  return getLabel(value, FUEL_TYPE_LABELS);
}

export function getEnergySource(value: EnergySource): string {
  return getLabel(value, ENERGY_SOURCE_LABELS);
}

export function getMeasurementUnit(value: BatchType): string {
  return getLabel(value, BATCH_TYPE_MEASUREMENT_UNIT);
}

export function getCsvDocumentIntegrityStatus(value: CsvDocumentIntegrityStatus): string {
  return getLabel(value, CSV_DOCUMENT_INTEGRITY_STATUS_LABELS);
}

export function getUnitType(value: UnitType): string {
  return getLabel(value, UNIT_TYPE_LABELS);
}

export function getCalculationTopic(value: CalculationTopic): string {
  return getLabel(value, CALCULATION_TOPIC_LABELS);
}

export function getRfnboType(value: RfnboType): string {
  return getLabel(value, RFNBO_TYPE_LABELS);
}

export function getPPaStatus(value: PowerPurchaseAgreementStatus): string {
  return getLabel(value, PPA_STATUS_LABELS);
}

export function getPowerType(value: PowerType): string {
  return getLabel(value, POWER_TYPE_LABELS);
}

export function getCsvContentType(value: CsvContentType): string {
  return getLabel(value, CSV_CONTENT_TYPE_LABELS);
}

export function getBatchType(value: BatchType): string {
  return getLabel(value, BATCH_TYPE_LABELS);
}

export function getProcessType(value: ProcessType): string {
  return getLabel(value, PROCESS_TYPE_LABELS);
}

function getLabel<T extends string>(value: T, labels: Record<T, string>): string {
  const label = labels[value];

  if (!label) {
    throw new Error(`Unmapped enum value: ${value}`);
  }

  return label;
}
