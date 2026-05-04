/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionAccountingPeriod, UnitAccountingPeriods } from '@h2-trust/contracts/entities';
import { CsvContentType } from '@h2-trust/domain';
import { ParsedImport } from './production.types';
import { normalizeProduction } from './production-normalizer';

describe('normalizeProduction', () => {
  describe('normalizeProduction', () => {
    it('aggregates accounting periods per hour for the same unit and type', () => {
      const parsedImports: ParsedImport[] = [
        {
          fileName: 'hydrogen.csv',
          hash: 'hash',
          cid: 'cid',
          type: CsvContentType.HYDROGEN,
          periods: new UnitAccountingPeriods('unit-1', [
            new StagedProductionAccountingPeriod(10, new Date('2026-01-01T08:10:00Z'), 100),
            new StagedProductionAccountingPeriod(15, new Date('2026-01-01T08:25:00Z'), 120),
            new StagedProductionAccountingPeriod(20, new Date('2026-01-01T09:00:00Z'), 150),
          ]),
        },
      ];

      const actualResult = normalizeProduction(parsedImports, 'owner-1');

      expect(actualResult).toHaveLength(2);
      expect(actualResult[0]).toMatchObject({
        unitId: 'unit-1',
        ownerId: 'owner-1',
        amountProduced: 25,
        powerConsumed: 220,
        type: CsvContentType.HYDROGEN,
      });
      expect(actualResult[0].startedAt).toEqual(new Date('2026-01-01T08:00:00Z'));
      expect(actualResult[0].endedAt).toEqual(new Date('2026-01-01T08:59:59Z'));

      expect(actualResult[1]).toMatchObject({
        unitId: 'unit-1',
        ownerId: 'owner-1',
        amountProduced: 20,
        powerConsumed: 150,
        type: CsvContentType.HYDROGEN,
      });
      expect(actualResult[1].startedAt).toEqual(new Date('2026-01-01T09:00:00Z'));
      expect(actualResult[1].endedAt).toEqual(new Date('2026-01-01T09:59:59Z'));
    });

    it('keeps imports separated by production type while preserving unit level results', () => {
      const parsedImports: ParsedImport[] = [
        {
          fileName: 'power.csv',
          hash: 'power-hash',
          cid: 'power-cid',
          type: CsvContentType.POWER,
          periods: new UnitAccountingPeriods('power-unit', [
            new StagedProductionAccountingPeriod(30, new Date('2026-01-01T10:15:00Z'), 0),
          ]),
        },
        {
          fileName: 'hydrogen.csv',
          hash: 'hydrogen-hash',
          cid: 'hydrogen-cid',
          type: CsvContentType.HYDROGEN,
          periods: new UnitAccountingPeriods('hydrogen-unit', [
            new StagedProductionAccountingPeriod(12, new Date('2026-01-01T10:45:00Z'), 40),
          ]),
        },
      ];

      const actualResult = normalizeProduction(parsedImports, 'owner-2');

      expect(actualResult).toHaveLength(2);
      expect(actualResult).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            unitId: 'power-unit',
            ownerId: 'owner-2',
            amountProduced: 30,
            powerConsumed: 0,
            type: CsvContentType.POWER,
          }),
          expect.objectContaining({
            unitId: 'hydrogen-unit',
            ownerId: 'owner-2',
            amountProduced: 12,
            powerConsumed: 40,
            type: CsvContentType.HYDROGEN,
          }),
        ]),
      );
    });
  });
});