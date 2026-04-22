/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionAccountingPeriod } from './accounting-period.entity';

export class UnitAccountingPeriods {
  unitId: string;
  accountingPeriods: StagedProductionAccountingPeriod[];

  constructor(unitId: string, accountingPeriods: StagedProductionAccountingPeriod[]) {
    this.unitId = unitId;
    this.accountingPeriods = accountingPeriods;
  }
}
