/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridLevel, HydrogenProductionMethod, HydrogenProductionTechnology, PowerProductionType } from '../enums';

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
    [HydrogenProductionTechnology.AEL]: 'Alkaline Electrolysis (AEL)',
    [HydrogenProductionTechnology.AEM]: 'Anion Exchange Membrane (AEM)',
    [HydrogenProductionTechnology.PEM]: 'Proton Exchange Membrane (PEM)',
    [HydrogenProductionTechnology.SOEC]: 'Solid Oxide Electrolysis Cell (SOEC)',
  };

  private static getLabel<T extends string>(value: T, labels: Record<T, string>): string {
    const label = labels[value];
    if (!label) {
      throw new Error(`Unmapped enum value: ${value}`);
    }
    return label;
  }

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
}
