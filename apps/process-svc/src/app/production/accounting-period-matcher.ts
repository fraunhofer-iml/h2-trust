/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  ParsedProductionEntity,
  UnitAccountingPeriods,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';

interface PowerItem {
  unitId: string;
  amount: number;
}

interface HydrogenItem {
  unitId: string;
  amount: number;
  powerConsumed: number;
}

export class AccountingPeriodMatcher {
  static matchAccountingPeriods(
    powerProductions: UnitAccountingPeriods<AccountingPeriodPower>[],
    hydrogenProductions: UnitAccountingPeriods<AccountingPeriodHydrogen>[],
    gridUnitId: string,
  ): ParsedProductionEntity[] {
    this.validateBundles(hydrogenProductions, BatchType.HYDROGEN);
    this.validateBundles(powerProductions, BatchType.POWER);

    const powerItemsByDateHour: Map<string, PowerItem[]> = this.normalizePower(powerProductions);
    const hydrogenItemsByDateHour: Map<string, HydrogenItem[]> = this.normalizeHydrogen(hydrogenProductions);

    const parsedProductions: ParsedProductionEntity[] = [];

    for (const [dateHour, hydrogenItems] of hydrogenItemsByDateHour) {
      const powerItems: PowerItem[] = powerItemsByDateHour.get(dateHour);
      const { amount, unitId, powerConsumed } = hydrogenItems[0];
      const parsedDateHour = new Date(dateHour);

      if (!powerItems) {
        parsedProductions.push({
          startedAt: parsedDateHour,
          hydrogenAmount: amount,
          hydrogenProductionUnitId: unitId,
          powerAmount: powerConsumed,
          powerProductionUnitId: gridUnitId,
        });
        continue;
      }

      let remainingPower = powerConsumed;
      let remainingHydrogen = amount;

      for (const powerItem of powerItems) {
        if (remainingPower <= 0) {
          break;
        }

        const powerUsed = Math.min(powerItem.amount, remainingPower);
        const powerUsageRatio = powerUsed / remainingPower;
        const hydrogenUsed = remainingHydrogen * powerUsageRatio;

        parsedProductions.push({
          startedAt: parsedDateHour,
          hydrogenAmount: hydrogenUsed,
          hydrogenProductionUnitId: unitId,
          powerAmount: powerUsed,
          powerProductionUnitId: powerItem.unitId,
        });

        remainingPower -= powerUsed;
        remainingHydrogen -= hydrogenUsed;
      }

      if (remainingHydrogen > 0) {
        parsedProductions.push({
          startedAt: parsedDateHour,
          hydrogenAmount: remainingHydrogen,
          hydrogenProductionUnitId: unitId,
          powerAmount: remainingPower,
          powerProductionUnitId: gridUnitId,
        });
      }
    }

    if (parsedProductions.length === 0)
      throw new BrokerException(
        'The data on electricity production and hydrogen production are not in the same time frame.',
        HttpStatus.BAD_REQUEST,
      );

    return parsedProductions;
  }

  private static normalizePower(data: UnitAccountingPeriods<AccountingPeriodPower>[]): Map<string, PowerItem[]> {
    const powerItemsByDateHour = new Map<string, PowerItem[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.accountingPeriods.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);

          acc[dateHourKey] = (acc[dateHourKey] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(hourlyTotals).forEach(([timestamp, amount]) => {
        this.addToMap<PowerItem>(powerItemsByDateHour, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
        });
      });
    });

    return powerItemsByDateHour;
  }

  private static normalizeHydrogen(
    data: UnitAccountingPeriods<AccountingPeriodHydrogen>[],
  ): Map<string, HydrogenItem[]> {
    const hydrogenItemsByDateHour = new Map<string, HydrogenItem[]>();

    data.forEach((bundle) => {
      const hourlyTotals = bundle.accountingPeriods.reduce(
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
        this.addToMap<HydrogenItem>(hydrogenItemsByDateHour, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
          powerConsumed,
        });
      });
    });

    return hydrogenItemsByDateHour;
  }

  private static addToMap<T extends PowerItem | HydrogenItem>(map: Map<string, T[]>, key: string, value: T): void {
    if (!map.get(key)) map.set(key, [value]);
    else map.get(key).push(value);
  }

  private static validateBundles(
    bundles: UnitAccountingPeriods<any>[] | undefined,
    type: BatchType.POWER | BatchType.HYDROGEN,
  ) {
    if (!bundles || bundles.length === 0) {
      throw new BrokerException(`Missing ${type} production data`, HttpStatus.BAD_REQUEST);
    }

    if (bundles.some((bundle) => !bundle.unitId || bundle.accountingPeriods.length === 0)) {
      throw new BrokerException(`Invalid unit data relation for ${type} production`, HttpStatus.BAD_REQUEST);
    }
  }
}
