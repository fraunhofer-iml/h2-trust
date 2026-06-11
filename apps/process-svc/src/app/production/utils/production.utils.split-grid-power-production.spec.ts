/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProductionEntity } from '@h2-trust/contracts/entities';
import { PowerProductionType, PowerType, RenewableShareInGridMix } from '@h2-trust/domain';
import { splitGridPowerProduction } from './production.utils';

describe('ProductionUtils.splitGridPowerProduction', () => {
  it('should return the original production unchanged when the energy source is not grid', () => {
    // arrange
    const givenCreateProduction = new CreateProductionEntity(
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-01T00:59:59Z'),
      'power-unit-1',
      PowerType.RENEWABLE,
      100,
      'hydrogen-unit-1',
      10,
      'user-1',
      'storage-unit-1',
      'power-owner-1',
      'hydrogen-owner-1',
      20,
    );

    // act
    const actualResult = splitGridPowerProduction(givenCreateProduction, PowerProductionType.PHOTOVOLTAIC_SYSTEM);

    // assert
    expect(actualResult).toEqual([givenCreateProduction]);
  });

  it('should split grid energy into partly renewable and non-renewable productions when the energy source is grid', () => {
    // arrange
    const givenCreateProduction = new CreateProductionEntity(
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-01T00:59:59Z'),
      'grid-unit-1',
      PowerType.NOT_SPECIFIED,
      100,
      'hydrogen-unit-1',
      10,
      'user-1',
      'storage-unit-1',
      'power-owner-1',
      'hydrogen-owner-1',
      20,
    );

    // act
    const actualResult = splitGridPowerProduction(givenCreateProduction, PowerProductionType.GRID);

    // assert
    expect(actualResult).toHaveLength(2);
    expect(actualResult).toEqual([
      expect.objectContaining({
        powerType: PowerType.PARTLY_RENEWABLE,
        powerAmountKwh: (givenCreateProduction.powerAmountKwh * RenewableShareInGridMix.DE) / 100,
        hydrogenAmountKg: (givenCreateProduction.hydrogenAmountKg * RenewableShareInGridMix.DE) / 100,
        waterConsumptionLitersPerHour:
          (givenCreateProduction.waterConsumptionLitersPerHour * RenewableShareInGridMix.DE) / 100,
        powerProductionUnitId: givenCreateProduction.powerProductionUnitId,
        hydrogenProductionUnitId: givenCreateProduction.hydrogenProductionUnitId,
      }),
      expect.objectContaining({
        powerType: PowerType.NON_RENEWABLE,
        powerAmountKwh:
          givenCreateProduction.powerAmountKwh -
          (givenCreateProduction.powerAmountKwh * RenewableShareInGridMix.DE) / 100,
        hydrogenAmountKg:
          givenCreateProduction.hydrogenAmountKg -
          (givenCreateProduction.hydrogenAmountKg * RenewableShareInGridMix.DE) / 100,
        waterConsumptionLitersPerHour:
          givenCreateProduction.waterConsumptionLitersPerHour -
          (givenCreateProduction.waterConsumptionLitersPerHour * RenewableShareInGridMix.DE) / 100,
        powerProductionUnitId: givenCreateProduction.powerProductionUnitId,
        hydrogenProductionUnitId: givenCreateProduction.hydrogenProductionUnitId,
      }),
    ]);
  });
});
