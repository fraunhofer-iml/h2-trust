/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AccountingPeriodEntity,
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  ParsedFileBundles,
  UnitDataBundle,
} from '@h2-trust/amqp';

interface PowerMapItem {
  unitId: string;
  amount: number;
}

interface HydrogenMapItem {
  unitId: string;
  amount: number;
  powerConsumed: number;
}

@Injectable()
export class AccountingPeriodMatcherService {
  matchAccountingPeriods(data: ParsedFileBundles, gridUnitId: string) {
    const normalizedPowerData = this.normalizePowerLists(data.powerProduction);
    const normalizedH2Data = this.normalizeHydrogenLists(data.hydrogenProduction);

    const batches: AccountingPeriodEntity[] = [];

    normalizedH2Data.forEach((value, key) => {
      const powerProductionUnits = normalizedPowerData.get(key);
      const { amount, unitId, powerConsumed } = value[0];
      const date = new Date(key);

      if (powerItems) {
        let remainingPower = powerConsumed;

        for (const powerItem of powerItems) {
          if (remainingPower <= 0) break;
          const powerUsed = Math.min(unit.amount, remainingPower);
          const usageRatio = powerUsed / remainingPower;

          batches.push({
            startedAt: date,
            hydrogenAmount: amount * usageRatio,
            hydrogenProductionUnitId: unitId,
            powerAmount: powerUsed,
            powerProductionUnitId: powerProductionUnits[0].unitId,
          });

          remainingPower -= powerUsed;
        }

        if (remainingPower > 0)
          batches.push({
            startedAt: date,
            hydrogenAmount: (remainingPower / powerConsumed) * amount,
            hydrogenProductionUnitId: unitId,
            powerAmount: remainingPower,
            powerProductionUnitId: gridUnitId,
          });
      } else {
        batches.push({
          startedAt: date,
          hydrogenAmount: amount,
          hydrogenProductionUnitId: unitId,
          powerAmount: powerConsumed,
          powerProductionUnitId: gridUnitId,
        });
      }
    });

    if (batches.length === 0)
      throw new BrokerException(
        'The data on electricity production and hydrogen production are not in the same time frame.',
        HttpStatus.BAD_REQUEST,
      );

    return batches;
  }

  private normalizePowerLists(data: UnitDataBundle<AccountingPeriodPower>[]) {
    const map = new Map<string, PowerMapItem[]>();

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
      Object.entries(hourlyTotals).forEach(([timestamp, amount]) => {
        this.addToMap<PowerMapItem>(map, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
        });
      });
    });

    return map;
  }

  private normalizeHydrogenLists(data: UnitDataBundle<AccountingPeriodHydrogen>[]) {
    const map = new Map<string, HydrogenMapItem[]>();

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
      Object.entries(hourlyTotals).forEach(([timestamp, [amount, powerConsumed]]) => {
        this.addToMap<HydrogenMapItem>(map, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
          powerConsumed,
        });
      });
    });

    return map;
  }

  private addToMap<T extends PowerMapItem | HydrogenMapItem>(map: Map<string, T[]>, key: string, value: T) {
    if (!map.get(key)) map.set(key, [value]);
    else map.get(key).push(value);
  }
}
