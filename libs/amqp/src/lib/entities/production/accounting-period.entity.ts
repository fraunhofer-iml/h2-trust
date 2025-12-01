/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDbType } from '@h2-trust/database';

export class AccountingPeriodEntity {
  startedAt: Date;
  hydrogenAmount: number;
  hydrogenProductionUnitId: string;
  powerAmount: number;
  powerProductionUnitId: string;

  constructor(
    startedAt: Date,
    hydrogenAmount: number,
    hydrogenProductionUnitId: string,
    powerAmount: number,
    powerProductionUnitId: string,
  ) {
    this.startedAt = startedAt;
    this.hydrogenAmount = hydrogenAmount;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.powerAmount = powerAmount;
    this.powerProductionUnitId = powerProductionUnitId;
  }

  static fromDatabase(accountingPeriod: StagedProductionDbType) {
    return new AccountingPeriodEntity(
      accountingPeriod.startedAt,
      accountingPeriod.hydrogenAmount.toNumber(),
      accountingPeriod.hydrogenProductionUnitId,
      accountingPeriod.powerAmount.toNumber(),
      accountingPeriod.powerProductionUnitId,
    );
  }
}
