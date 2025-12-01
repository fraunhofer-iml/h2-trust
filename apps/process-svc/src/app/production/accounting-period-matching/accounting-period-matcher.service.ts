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

interface PowerItem {
  unitId: string;
  amount: number;
}

interface HydrogenItem {
  unitId: string;
  amount: number;
  powerConsumed: number;
}

@Injectable()
export class AccountingPeriodMatcherService {
  matchAccountingPeriods(data: ParsedFileBundles, gridUnitId: string) {
    this.validateBundles(data.hydrogenProduction, 'hydrogen');
    this.validateBundles(data.powerProduction, 'power');

    const powerByDateHour: Map<string, PowerItem[]> = this.normalizePowerLists(data.powerProduction);
    const hydrogenByDateHour: Map<string, HydrogenItem[]> = this.normalizeHydrogenLists(data.hydrogenProduction);

    const batches: AccountingPeriodEntity[] = [];

    for (const [dateHour, hydrogenItems] of hydrogenByDateHour) {
      const powerItemsByDateHour: PowerItem[] = powerByDateHour.get(dateHour);
      const { amount, unitId, powerConsumed } = hydrogenItems[0];
      const date = new Date(dateHour);

      if (!powerItemsByDateHour) {
        batches.push({
          startedAt: date,
          hydrogenAmount: amount,
          hydrogenProductionUnitId: unitId,
          powerAmount: powerConsumed,
          powerProductionUnitId: gridUnitId,
        });
        continue;
      }
      let remainingPower = powerConsumed;

      for (const powerItem of powerItemsByDateHour) {
        if (remainingPower <= 0) break;
        const powerUsed = Math.min(powerItem.amount, remainingPower);
        const usageRatio = powerUsed / remainingPower;

        batches.push({
          startedAt: date,
          hydrogenAmount: amount * usageRatio,
          hydrogenProductionUnitId: unitId,
          powerAmount: powerUsed,
          powerProductionUnitId: powerItem.unitId,
        });

        remainingPower -= powerUsed;
      }

      if (remainingPower > 0) {
        batches.push({
          startedAt: date,
          hydrogenAmount: (remainingPower / powerConsumed) * amount,
          hydrogenProductionUnitId: unitId,
          powerAmount: remainingPower,
          powerProductionUnitId: gridUnitId,
        });
      }
    }

    if (batches.length === 0)
      throw new BrokerException(
        'The data on electricity production and hydrogen production are not in the same time frame.',
        HttpStatus.BAD_REQUEST,
      );

    return batches;
  }

  private normalizePowerLists(data: UnitDataBundle<AccountingPeriodPower>[]): Map<string, PowerItem[]> {
    const map = new Map<string, PowerItem[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.data.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);

          acc[dateHourKey] = (acc[dateHourKey] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(hourlyTotals).forEach(([timestamp, amount]) => {
        this.addToMap<PowerItem>(map, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
        });
      });
    });

    return map;
  }

  private normalizeHydrogenLists(data: UnitDataBundle<AccountingPeriodHydrogen>[]): Map<string, HydrogenItem[]> {
    const map = new Map<string, HydrogenItem[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.data.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);

          if (!acc[dateHourKey]) acc[dateHourKey] = [0, 0];

          acc[dateHourKey][0] = (acc[dateHourKey][0] || 0) + item.amount;
          acc[dateHourKey][1] = (acc[dateHourKey][1] || 0) + item.power;
          return acc;
        },
        {} as Record<string, [number, number]>,
      );
      Object.entries(hourlyTotals).forEach(([timestamp, [amount, powerConsumed]]) => {
        this.addToMap<HydrogenItem>(map, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
          powerConsumed,
        });
      });
    });

    return map;
  }

  private addToMap<T extends PowerItem | HydrogenItem>(map: Map<string, T[]>, key: string, value: T): void {
    if (!map.get(key)) map.set(key, [value]);
    else map.get(key).push(value);
  }

  private validateBundles(bundles: UnitDataBundle<any>[] | undefined, type: 'hydrogen' | 'power') {
    if (!bundles || bundles.length === 0) {
      throw new BrokerException(`Missing ${type} production data`, HttpStatus.BAD_REQUEST);
    }

    if (bundles.some((bundle) => !bundle.unitId || bundle.data.length === 0)) {
      throw new BrokerException(`Invalid unit data relation for ${type} production`, HttpStatus.BAD_REQUEST);
    }
  }
}
