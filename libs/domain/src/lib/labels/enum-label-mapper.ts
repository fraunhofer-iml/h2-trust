/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridLevel, PowerProductionType } from '../enums';

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
}
