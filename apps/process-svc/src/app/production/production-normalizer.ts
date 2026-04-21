/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity, UnitAccountingPeriods } from '@h2-trust/amqp';
import { CsvContentType } from '@h2-trust/api';
import { ParsedImport } from './production.types';

interface PowerItem {
  unitId: string;
  amount: number;
}

interface HydrogenItem {
  unitId: string;
  amount: number;
  powerConsumed: number;
}

export class ProductionNormalizer {
  /**
   * Takes a list of accounting periods and merges them so that the result is a list of staged productions containing just one entry per hour.
   * @param accountingPeriods The list of accounting periods.
   * @param type The type of the stage productions that should be created.
   * @returns A list of staged productions with only one entry per hour.
   */
  public static normalizeProduction(parsedImports: ParsedImport[], ownerId: string): StagedProductionEntity[] {
    const parsedAccountingPeriodGroups: Record<CsvContentType, UnitAccountingPeriods[]> =
      this.groupAccountingPeriodsByType(parsedImports);

    const stagedProductionResult: StagedProductionEntity[] = [];
    Object.entries(parsedAccountingPeriodGroups).forEach(([productionType, parsedAccountingPeriodGroup]) => {
      const stagedProductionsForType: StagedProductionEntity[] = this.normalizeAccountingPeriods(
        parsedAccountingPeriodGroup,
        productionType as CsvContentType,
        ownerId,
      );
      stagedProductionResult.push(...stagedProductionsForType);
    });
    return stagedProductionResult;
  }

  private static groupAccountingPeriodsByType(
    parsedImports: ParsedImport[],
  ): Record<CsvContentType, UnitAccountingPeriods[]> {
    return parsedImports.reduce<Record<CsvContentType, UnitAccountingPeriods[]>>(
      (acc, parsedImport) => {
        return {
          ...acc,
          [parsedImport.type]: [...(acc[parsedImport.type] ?? []), parsedImport.periods],
        };
      },
      {} as Record<CsvContentType, UnitAccountingPeriods[]>,
    );
  }

  private static normalizeAccountingPeriods(
    unitAccountingPeriods: UnitAccountingPeriods[],
    type: CsvContentType,
    ownerId: string,
  ): StagedProductionEntity[] {
    const unitAccountingPeriodsByDateHour = new Map<string, StagedProductionEntity[]>();

    unitAccountingPeriods.forEach((unitAccountingPeriod) => {
      const hourlyProductionTotals = unitAccountingPeriod.accountingPeriods.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);

          acc[dateHourKey] = (acc[dateHourKey] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
      const hourlyPowerUsedTotals = unitAccountingPeriod.accountingPeriods.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);
          const powerUsed = item.power ?? 0;
          acc[dateHourKey] = (acc[dateHourKey] || 0) + powerUsed;

          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(hourlyProductionTotals).forEach(([timestamp, amount]) => {
        this.addToMap<StagedProductionEntity>(unitAccountingPeriodsByDateHour, `${timestamp}:00:00Z`, {
          unitId: unitAccountingPeriod.unitId,
          ownerId: ownerId,
          amount,
          startedAt: new Date(`${timestamp}:00:00Z`),
          endedAt: new Date(`${timestamp}:59:59Z`),
          powerUsed: timestamp in hourlyPowerUsedTotals ? hourlyPowerUsedTotals[timestamp] : 0,
          type: type,
        });
      });
    });

    return [...unitAccountingPeriodsByDateHour.values()].flatMap((x) => x);
  }

  private static addToMap<T extends PowerItem | HydrogenItem>(map: Map<string, T[]>, key: string, value: T): void {
    if (!map.get(key)) {
      map.set(key, [value]);
    } else {
      map.get(key).push(value);
    }
  }
}
