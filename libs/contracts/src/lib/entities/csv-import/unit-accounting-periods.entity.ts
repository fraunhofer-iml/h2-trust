/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountingPeriodHydrogen, AccountingPeriodPower } from './accounting-period.entity';

export class UnitAccountingPeriods<T extends AccountingPeriodPower | AccountingPeriodHydrogen> {
  unitId: string;
  accountingPeriods: T[];

  constructor(unitId: string, accountingPeriods: T[]) {
    this.unitId = unitId;
    this.accountingPeriods = accountingPeriods;
  }
}
