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
  HydrogenColor,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  MeasurementUnit,
  PowerProductionType,
  PowerPurchaseAgreementStatus,
  PowerType,
  RfnboType,
  UnitType,
} from '@h2-trust/domain';

export class EnumLabelMapper {
  private static readonly POWER_PRODUCTION_TYPE_LABELS: Record<PowerProductionType, string> = {
    [PowerProductionType.GRID]: 'Grid',
    [PowerProductionType.HYDRO_POWER_PLANT]: 'Hydro Power Plant',
    [PowerProductionType.PHOTOVOLTAIC_SYSTEM]: 'Photovoltaic System',
    [PowerProductionType.WIND_TURBINE]: 'Wind Turbine',
  };

  private static readonly GRID_LEVEL_LABELS: Record<GridLevel, string> = {
    [GridLevel.EXTRA_HIGH_VOLTAGE]: 'Extra High Voltage',
    [GridLevel.HIGH_VOLTAGE]: 'High Voltage',
    [GridLevel.MEDIUM_VOLTAGE]: 'Medium Voltage',
    [GridLevel.LOW_VOLTAGE]: 'Low Voltage',
  };

  private static readonly HYDROGEN_PRODUCTION_METHOD_LABELS: Record<HydrogenProductionMethod, string> = {
    [HydrogenProductionMethod.ELECTROLYSIS]: 'Electrolysis',
  };

  private static readonly HYDROGEN_PRODUCTION_TECHNOLOGY_LABELS: Record<HydrogenProductionTechnology, string> = {
    [HydrogenProductionTechnology.AEL]: 'AEL',
    [HydrogenProductionTechnology.AEM]: 'AEM',
    [HydrogenProductionTechnology.PEM]: 'PEM',
    [HydrogenProductionTechnology.SOEC]: 'SOEC',
  };

  private static readonly HYDROGEN_STORAGE_TYPE_LABELS: Record<HydrogenStorageType, string> = {
    [HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN]: 'Compressed Gaseous Hydrogen',
    [HydrogenStorageType.LIQUID_HYDROGEN]: 'Liquid Hydrogen',
  };

  private static readonly FUEL_TYPE_LABELS: Record<FuelType, string> = {
    [FuelType.DIESEL]: 'Diesel',
  };

  private static readonly ENERGY_SOURCE_LABELS: Record<EnergySource, string> = {
    [EnergySource.GRID]: 'Grid',
    [EnergySource.HYDRO_POWER]: 'Hydro Power Plant',
    [EnergySource.SOLAR_ENERGY]: 'Photovoltaic System',
    [EnergySource.WIND_ENERGY]: 'Wind Turbine',
  };

  private static readonly HYDROGEN_COLOR_LABELS: Record<HydrogenColor, string> = {
    [HydrogenColor.GREEN]: 'Green',
    [HydrogenColor.MIX]: 'Mix',
    [HydrogenColor.YELLOW]: 'Yellow',
  };

  private static readonly BATCH_TYPE_MEASUREMENT_UNIT: Record<BatchType, string> = {
    [BatchType.HYDROGEN]: MeasurementUnit.KG,
    [BatchType.POWER]: MeasurementUnit.KWH,
    [BatchType.WATER]: MeasurementUnit.L,
  };

  private static readonly CSV_DOCUMENT_INTEGRITY_STATUS_LABELS: Record<CsvDocumentIntegrityStatus, string> = {
    [CsvDocumentIntegrityStatus.VERIFIED]: 'Verified',
    [CsvDocumentIntegrityStatus.MISMATCH]: 'Mismatch',
    [CsvDocumentIntegrityStatus.FAILED]: 'Failed',
  };

  private static readonly UNIT_TYPE_LABELS: Record<UnitType, string> = {
    [UnitType.POWER_PRODUCTION]: 'Power Production',
    [UnitType.HYDROGEN_PRODUCTION]: 'Hydrogen Production',
    [UnitType.HYDROGEN_STORAGE]: 'Hydrogen Storage',
  };

  private static readonly CALCULATION_TOPIC_LABELS: Record<CalculationTopic, string> = {
    [CalculationTopic.HYDROGEN_BOTTLING]: 'Bottling',
    [CalculationTopic.POWER_SUPPLY]: 'Power Supply',
    [CalculationTopic.WATER_SUPPLY]: 'Water Supply',
    [CalculationTopic.HYDROGEN_STORAGE]: 'Hydrogen Storage',
    [CalculationTopic.HYDROGEN_TRANSPORTATION]: 'Transportation',
  };

  private static readonly RFNBO_TYPE_LABELS: Record<RfnboType, string> = {
    [RfnboType.RFNBO_READY]: 'RFNBO Ready',
    [RfnboType.NON_CERTIFIABLE]: 'Non Certifiable',
    [RfnboType.NOT_SPECIFIED]: 'Not Specified',
  };

  private static readonly PPA_STATUS_LABELS: Record<PowerPurchaseAgreementStatus, string> = {
    [PowerPurchaseAgreementStatus.REJECTED]: 'Rejected',
    [PowerPurchaseAgreementStatus.PENDING]: 'Pending',
    [PowerPurchaseAgreementStatus.APPROVED]: 'Approved',
  };

  private static readonly POWER_TYPE_LABELS: Record<PowerType, string> = {
    [PowerType.RENEWABLE]: 'Renewable',
    [PowerType.PARTLY_RENEWABLE]: 'Partly Renewable',
    [PowerType.NON_RENEWABLE]: 'Non Renewable',
    [PowerType.NOT_SPECIFIED]: 'Not Specified',
  };

  private static readonly CSV_CONTENT_TYPE_LABELS: Record<CsvContentType, string> = {
    [CsvContentType.POWER]: 'Power',
    [CsvContentType.HYDROGEN]: 'Hydrogen',
  };

  public static getPowerProductionType(value: PowerProductionType): string {
    return this.getLabel(value, this.POWER_PRODUCTION_TYPE_LABELS);
  }

  public static getGridLevel(value: GridLevel): string {
    return this.getLabel(value, this.GRID_LEVEL_LABELS);
  }

  public static getHydrogenProductionMethod(value: HydrogenProductionMethod): string {
    return this.getLabel(value, this.HYDROGEN_PRODUCTION_METHOD_LABELS);
  }

  public static getHydrogenProductionTechnology(value: HydrogenProductionTechnology): string {
    return this.getLabel(value, this.HYDROGEN_PRODUCTION_TECHNOLOGY_LABELS);
  }

  public static getHydrogenStorageType(value: HydrogenStorageType): string {
    return this.getLabel(value, this.HYDROGEN_STORAGE_TYPE_LABELS);
  }

  public static getFuelType(value: FuelType): string {
    return this.getLabel(value, this.FUEL_TYPE_LABELS);
  }

  public static getEnergySource(value: EnergySource): string {
    return this.getLabel(value, this.ENERGY_SOURCE_LABELS);
  }

  public static getHydrogenColor(value: HydrogenColor): string {
    return this.getLabel(value, this.HYDROGEN_COLOR_LABELS);
  }

  public static getMeasurementUnit(value: BatchType): string {
    return this.getLabel(value, this.BATCH_TYPE_MEASUREMENT_UNIT);
  }

  public static getCsvDocumentIntegrityStatus(value: CsvDocumentIntegrityStatus): string {
    return this.getLabel(value, this.CSV_DOCUMENT_INTEGRITY_STATUS_LABELS);
  }

  public static getUnitType(value: UnitType): string {
    return this.getLabel(value, this.UNIT_TYPE_LABELS);
  }

  public static getCalculationTopic(value: CalculationTopic): string {
    return this.getLabel(value, this.CALCULATION_TOPIC_LABELS);
  }

  public static getRfnboType(value: RfnboType): string {
    return this.getLabel(value, this.RFNBO_TYPE_LABELS);
  }

  public static getPPaStatus(value: PowerPurchaseAgreementStatus): string {
    return this.getLabel(value, this.PPA_STATUS_LABELS);
  }

  public static getPowerType(value: PowerType): string {
    return this.getLabel(value, this.POWER_TYPE_LABELS);
  }

  public static getCsvContentType(value: CsvContentType): string {
    return this.getLabel(value, this.CSV_CONTENT_TYPE_LABELS);
  }

  private static getLabel<T extends string>(value: T, labels: Record<T, string>): string {
    const label = labels[value];

    if (!label) {
      throw new Error(`Unmapped enum value: ${value}`);
    }

    return label;
  }
}
