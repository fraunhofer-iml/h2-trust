/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionType } from '../enums';

export class EnumLabelMapper {
  private static readonly POWER_PRODUCTION_TYPE_LABELS: Record<PowerProductionType, string> = {
    [PowerProductionType.GRID]: 'Grid',
    [PowerProductionType.HYDRO_POWER_PLANT]: 'Hydro Power Plant',
    [PowerProductionType.PHOTOVOLTAIC_SYSTEM]: 'Photovoltaic System',
    [PowerProductionType.WIND_TURBINE]: 'Wind Turbine',
  };

  private static getLabel<T extends string>(value: T, labels: Record<T, string>): string {
    const label = labels[value];
    if (!label) {
      throw new Error(`Unmapped enum value: ${value}`);
    }
    return label;
  }

  public static getPowerProductionType(status: PowerProductionType): string {
    return this.getLabel(status, this.POWER_PRODUCTION_TYPE_LABELS);
  }
}
