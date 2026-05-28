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
  PowerPurchaseAgreementStatus,
  PowerType,
  ProcessType,
  RfnboType,
  UnitType,
} from '@h2-trust/domain';

const ICONS = {
  UNITS: {
    POWER_PRODUCTION: 'electric_bolt',
    HYDROGEN_PRODUCTION: 'water_ec',
    HYDROGEN_STORAGE: 'propane',
    BOTTLING: 'gas_meter',
    END_USE: 'output',
    TRANSPORTATION: 'pin_road',
    COMPRESSION: 'compress',
  },
  PROCESS_STEPS: {
    WATER_SUPPLY: 'water_drop',
    POWER_SUPPLY: 'electric_bolt',
    TRANSPORTATION: 'pin_road',
    HYDROGEN_BOTTLING: 'gas_meter',
    HYDROGEN_STORAGE: 'propane',
    HYDROGEN_PRODUCTION: 'water_ec',
  },
  HYDROGEN: {
    BASE: 'water_ec',
    RFNBO_READY: 'editor_choice',
    NON_CERTIFIABLE: 'release_alert',
  },
  POWER: {
    BASE: 'electric_bolt',
    RENEWABLE: 'nest_eco_leaf',
    PARTLY_RENEWABLE: 'donut_large',
    NON_RENEWABLE: 'oil_barrel',
  },
  STATUS: {
    ACTIVE: 'bedtime_off',
    INACTIVE: 'bedtime',
  },
  PPA_STATUS: {
    PENDING: 'pending',
    APPROVED: 'check_circle',
    REJECTED: 'cancel',
  },
};

const UNIT_ICON_BY_TYPE: Record<UnitType, string> = {
  [UnitType.POWER_PRODUCTION]: ICONS.UNITS.POWER_PRODUCTION,
  [UnitType.HYDROGEN_PRODUCTION]: ICONS.UNITS.HYDROGEN_PRODUCTION,
  [UnitType.HYDROGEN_STORAGE]: ICONS.UNITS.HYDROGEN_STORAGE,
  [UnitType.BOTTLING]: ICONS.UNITS.BOTTLING,
  [UnitType.END_USE]: ICONS.UNITS.END_USE,
  [UnitType.TRANSPORTATION]: ICONS.UNITS.TRANSPORTATION,
  [UnitType.COMPRESSION]: ICONS.UNITS.COMPRESSION,
};

const CSV_CONTENT_ICON_BY_TYPE: Record<CsvContentType, string> = {
  [CsvContentType.HYDROGEN]: ICONS.UNITS.HYDROGEN_PRODUCTION,
  [CsvContentType.POWER]: ICONS.UNITS.POWER_PRODUCTION,
};

const RFNBO_ICON_BY_TYPE: Record<RfnboType, string> = {
  [RfnboType.NOT_SPECIFIED]: ICONS.HYDROGEN.BASE,
  [RfnboType.RFNBO_READY]: ICONS.HYDROGEN.RFNBO_READY,
  [RfnboType.NON_CERTIFIABLE]: ICONS.HYDROGEN.NON_CERTIFIABLE,
};

const SELECTABLE_TYPE_ICON_BY_TYPE: Record<UnitType | CsvContentType | RfnboType, string> = {
  ...UNIT_ICON_BY_TYPE,
  ...CSV_CONTENT_ICON_BY_TYPE,
  ...RFNBO_ICON_BY_TYPE,
};

const PPA_STATUS_ICON_BY_TYPE: Record<PowerPurchaseAgreementStatus, string> = {
  [PowerPurchaseAgreementStatus.PENDING]: ICONS.PPA_STATUS.PENDING,
  [PowerPurchaseAgreementStatus.APPROVED]: ICONS.PPA_STATUS.APPROVED,
  [PowerPurchaseAgreementStatus.REJECTED]: ICONS.PPA_STATUS.REJECTED,
};

const POWER_TYPE_ICON_BY_TYPE: Record<PowerType, string> = {
  [PowerType.NOT_SPECIFIED]: ICONS.POWER.NON_RENEWABLE,
  [PowerType.NON_RENEWABLE]: ICONS.POWER.NON_RENEWABLE,
  [PowerType.PARTLY_RENEWABLE]: ICONS.POWER.PARTLY_RENEWABLE,
  [PowerType.RENEWABLE]: ICONS.POWER.RENEWABLE,
};

const BATCH_TYPE_ICON_BY_TYPE: Record<BatchType, string> = {
  [BatchType.HYDROGEN]: ICONS.PROCESS_STEPS.HYDROGEN_STORAGE,
  [BatchType.POWER]: ICONS.PROCESS_STEPS.POWER_SUPPLY,
  [BatchType.WATER]: ICONS.PROCESS_STEPS.WATER_SUPPLY,
};

const CALCULATION_TOPIC_ICON_BY_TYPE: Record<CalculationTopic, string> = {
  [CalculationTopic.HYDROGEN_STORAGE]: ICONS.PROCESS_STEPS.HYDROGEN_STORAGE,
  [CalculationTopic.WATER_SUPPLY]: ICONS.PROCESS_STEPS.WATER_SUPPLY,
  [CalculationTopic.HYDROGEN_TRANSPORTATION]: ICONS.PROCESS_STEPS.TRANSPORTATION,
  [CalculationTopic.POWER_SUPPLY]: ICONS.PROCESS_STEPS.POWER_SUPPLY,
  [CalculationTopic.HYDROGEN_BOTTLING]: ICONS.PROCESS_STEPS.HYDROGEN_BOTTLING,
};

const PROCESS_STEP_ICON_BY_TYPE: Record<ProcessType, string> = {
  [ProcessType.POWER_PRODUCTION]: ICONS.PROCESS_STEPS.POWER_SUPPLY,
  [ProcessType.WATER_CONSUMPTION]: ICONS.PROCESS_STEPS.WATER_SUPPLY,
  [ProcessType.HYDROGEN_PRODUCTION]: ICONS.PROCESS_STEPS.HYDROGEN_PRODUCTION,
  [ProcessType.HYDROGEN_BOTTLING]: ICONS.PROCESS_STEPS.HYDROGEN_BOTTLING,
  [ProcessType.HYDROGEN_TRANSPORTATION]: ICONS.PROCESS_STEPS.TRANSPORTATION,
  [ProcessType.COMPRESSION]: ICONS.UNITS.COMPRESSION,
  [ProcessType.HYDROGEN_STORAGE]: ICONS.UNITS.HYDROGEN_STORAGE,
  [ProcessType.END_USE]: ICONS.UNITS.END_USE,
};

type PowerStatisticsIconKey = 'BASE' | Exclude<PowerType, PowerType.NOT_SPECIFIED>;

const POWER_STATISTICS_ICON_BY_KEY: Record<PowerStatisticsIconKey, string> = {
  BASE: ICONS.POWER.BASE,
  [PowerType.RENEWABLE]: ICONS.POWER.RENEWABLE,
  [PowerType.PARTLY_RENEWABLE]: ICONS.POWER.PARTLY_RENEWABLE,
  [PowerType.NON_RENEWABLE]: ICONS.POWER.NON_RENEWABLE,
};

type HydrogenStatisticsIconKey = 'BASE' | Exclude<RfnboType, RfnboType.NOT_SPECIFIED>;

const HYDROGEN_STATISTICS_ICON_BY_TYPE: Record<HydrogenStatisticsIconKey, string> = {
  BASE: ICONS.HYDROGEN.BASE,
  [RfnboType.RFNBO_READY]: ICONS.HYDROGEN.RFNBO_READY,
  [RfnboType.NON_CERTIFIABLE]: ICONS.HYDROGEN.NON_CERTIFIABLE,
};

export function getUnitIcon(unitType: UnitType): string {
  return UNIT_ICON_BY_TYPE[unitType];
}

export function getSelectableTypeIcon(type: UnitType | CsvContentType | RfnboType): string {
  return SELECTABLE_TYPE_ICON_BY_TYPE[type] ?? '';
}

export function getCsvContentTypeIcon(type: CsvContentType): string {
  return CSV_CONTENT_ICON_BY_TYPE[type];
}

export function getRfnboIcon(type: RfnboType): string {
  return RFNBO_ICON_BY_TYPE[type];
}

export function getPpaStatusIcon(status: PowerPurchaseAgreementStatus): string {
  return PPA_STATUS_ICON_BY_TYPE[status];
}

export function getPowerTypeIcon(type: PowerType): string {
  return POWER_TYPE_ICON_BY_TYPE[type];
}

export function getBatchTypeIcon(type: BatchType): string {
  return BATCH_TYPE_ICON_BY_TYPE[type];
}

export function getCalculationTopicIcon(topic: CalculationTopic): string {
  return CALCULATION_TOPIC_ICON_BY_TYPE[topic];
}

export function getPowerStatisticsIcon(key: PowerStatisticsIconKey): string {
  return POWER_STATISTICS_ICON_BY_KEY[key];
}

export function getHydrogenStatisticsIcon(type: HydrogenStatisticsIconKey): string {
  return HYDROGEN_STATISTICS_ICON_BY_TYPE[type];
}

export function getProcessTypeIcon(type: ProcessType): string {
  return PROCESS_STEP_ICON_BY_TYPE[type];
}
