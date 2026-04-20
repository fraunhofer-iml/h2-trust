/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity, UnitAccountingPeriods } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
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
  public static normalizeProduction(parsedImports: ParsedImport[]): StagedProductionEntity[] {
    const parsedAccountingPeriodGroups: Record<BatchType, UnitAccountingPeriods[]> =
      this.groupAccountingPeriodsByType(parsedImports);

    const stagedProductionResult: StagedProductionEntity[] = [];
    Object.entries(parsedAccountingPeriodGroups).forEach(([productionType, parsedAccountingPeriodGroup]) => {
      const stagedProductionsForType: StagedProductionEntity[] = this.normalizeAccountingPeriods(
        parsedAccountingPeriodGroup,
        productionType as BatchType,
      );
      stagedProductionResult.push(...stagedProductionsForType);
    });
    return stagedProductionResult;
  }

  private static groupAccountingPeriodsByType(
    parsedImports: ParsedImport[],
  ): Record<BatchType, UnitAccountingPeriods[]> {
    return parsedImports.reduce<Record<string, UnitAccountingPeriods[]>>((acc, parsedImport) => {
      return {
        ...acc,
        [parsedImport.type]: [...(acc[parsedImport.type] ?? []), parsedImport.periods],
      };
    }, {});
  }

  private static normalizeAccountingPeriods(
    accountingPeriods: UnitAccountingPeriods[],
    type: BatchType,
  ): StagedProductionEntity[] {
    const unitAccountingPeriodsByDateHour = new Map<string, StagedProductionEntity[]>();

    accountingPeriods.forEach((bundle) => {
      const hourlyProductionTotals = bundle.accountingPeriods.reduce(
        (acc, item) => {
          console.log(item);
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);

          acc[dateHourKey] = (acc[dateHourKey] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
      const hourlyPowerUsedTotals = bundle.accountingPeriods.reduce(
        (acc, item) => {
          const date = new Date(item.time);
          const dateHourKey = date.toISOString().slice(0, 13);
          const usedPower = item.power ?? 0;
          acc[dateHourKey] = (acc[dateHourKey] || 0) + usedPower;

          return acc;
        },
        {} as Record<string, number>,
      );
      Object.entries(hourlyProductionTotals).forEach(([timestamp, amount]) => {
        this.addToMap<StagedProductionEntity>(unitAccountingPeriodsByDateHour, `${timestamp}:00:00Z`, {
          unitId: bundle.unitId,
          amount,
          startedAt: new Date(`${timestamp}:00:00Z`),
          usedPower: timestamp in hourlyPowerUsedTotals ? hourlyPowerUsedTotals[timestamp] : 0,
          type: type,
          filename: '',
        });
      });
    });

    return [...unitAccountingPeriodsByDateHour.values()].flatMap((x) => x);
  }

  private static addToMap<T extends PowerItem | HydrogenItem>(map: Map<string, T[]>, key: string, value: T): void {
    if (!map.get(key)) map.set(key, [value]);
    else map.get(key).push(value);
  }
}
