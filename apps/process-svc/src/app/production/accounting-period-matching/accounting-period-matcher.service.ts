/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  ParsedFileBundles,
  ProductionIntervallEntity,
  UnitDataBundle,
} from '@h2-trust/amqp';

@Injectable()
export class AccountingPeriodMatcherService {
  matchIntervalls(data: ParsedFileBundles, gridUnitId: string) {
    const normalizedPowerData = this.normalizePowerLists(data.powerProduction);
    const normalizedH2Data = this.normalizeHydrogenLists(data.hydrogenProduction);

    const batches: ProductionIntervallEntity[] = [];

    normalizedH2Data.forEach((value, key) => {
      const power = normalizedPowerData.get(key);
      if (power) {
        const powerConsumed = value[0].powerConsumed;
        let remainingPower = powerConsumed;

        while (power.length > 0 && remainingPower > 0) {
          const powerUsed = power[0].amount > powerConsumed ? powerConsumed : power[0].amount;
          const fraction = powerUsed / powerConsumed;

          batches.push({
            date: new Date(key),
            hydrogenAmount: value[0].amount * fraction,
            hydrogenProductionUnitId: value[0].unitId,
            powerAmount: powerUsed,
            powerProductionUnitId: power[0].unitId,
          });

          remainingPower -= powerUsed;
          power.splice(0);
        }

        if (remainingPower > 0) {
          // TODO: divide in two batches representing the green and yellow power part of grid power

          batches.push({
            date: new Date(key),
            hydrogenAmount: (remainingPower / powerConsumed) * value[0].amount,
            hydrogenProductionUnitId: value[0].unitId,
            powerAmount: remainingPower,
            powerProductionUnitId: gridUnitId,
          });
        }
      }
    });
    return batches;
  }

  normalizePowerLists(data: UnitDataBundle<AccountingPeriodPower>[]) {
    const powerMap = new Map<string, { unitId: string; amount: number }[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.data.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const hourKey = date.toISOString().slice(0, 13);

          acc[hourKey] = (acc[hourKey] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(hourlyTotals).forEach(([key, value]) => {
        this.addToMap<{ unitId: string; amount: number }>(powerMap, `${key}:00:00Z`, {
          unitId: bundle.unitId,
          amount: value,
        });
      });
    });

    return powerMap;
  }

  normalizeHydrogenLists(data: UnitDataBundle<AccountingPeriodHydrogen>[]) {
    const powerMap = new Map<string, { unitId: string; amount: number; powerConsumed: number }[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.data.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const hourKey = date.toISOString().slice(0, 13);

          if (!acc[hourKey]) acc[hourKey] = [0, 0];

          acc[hourKey][0] = (acc[hourKey][0] || 0) + item.amount;
          acc[hourKey][1] = (acc[hourKey][1] || 0) + item.power;
          return acc;
        },
        {} as Record<string, [number, number]>,
      );
      Object.entries(hourlyTotals).forEach(([key, value]) => {
        this.addToMap<{ unitId: string; amount: number; powerConsumed: number }>(powerMap, `${key}:00:00Z`, {
          unitId: bundle.unitId,
          amount: value[0],
          powerConsumed: value[1],
        });
      });
    });

    return powerMap;
  }

  private addToMap<
    T extends { unitId: string; amount: number } | { unitId: string; amount: number; powerConsumed: number },
  >(map: Map<string, { unitId: string; amount: number }[]>, key: string, value: T) {
    if (!map.get(key)) map.set(key, [value]);
    else map.get(key).push(value);
  }
}
