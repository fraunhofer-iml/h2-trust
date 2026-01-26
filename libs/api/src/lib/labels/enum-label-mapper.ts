/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchType,
  EnergySource,
  GridLevel,
  HydrogenColor,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  PowerProductionType,
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

  private static readonly FUEL_TYPE_LABELS: Record<string, string> = {
    DIESEL: 'Diesel',
  };

  private static readonly ENERGY_SOURCE_LABELS: Record<EnergySource, string> = {
    [EnergySource.GRID]: 'Grid',
    [EnergySource.HYDRO_POWER]: 'Hydro Power Plant',
    [EnergySource.SOLAR_ENERGY]: 'Photovoltaic System',
    [EnergySource.WIND_ENERGY]: 'Wind Turbine',
  };

  private static readonly HYDROGEN_COLORS: Record<HydrogenColor, string> = {
    [HydrogenColor.GREEN]: 'Green',
    [HydrogenColor.MIX]: 'Mix',
    [HydrogenColor.YELLOW]: 'Yellow',
  };

  private static readonly MEASUREMENT_UNIT_LABELS: Record<BatchType, string> = {
    [BatchType.HYDROGEN]: 'kg',
    [BatchType.POWER]: 'kWh',
    [BatchType.WATER]: 'l',
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

  public static getFuelType(value: string): string {
    return this.getLabel(value, this.FUEL_TYPE_LABELS);
  }

  public static getEnergySource(value: EnergySource): string {
    return this.getLabel(value, this.ENERGY_SOURCE_LABELS);
  }

  public static getHydrogenColor(value: HydrogenColor): string {
    return this.getLabel(value, this.HYDROGEN_COLORS);
  }

  public static getMeasurementUnit(value: BatchType): string {
    return this.getLabel(value, this.MEASUREMENT_UNIT_LABELS);
  }

  private static getLabel<T extends string>(value: T, labels: Record<T, string>): string {
    const label = labels[value];
    if (!label) {
      throw new Error(`Unmapped enum value: ${value}`);
    }
    return label;
  }
}
