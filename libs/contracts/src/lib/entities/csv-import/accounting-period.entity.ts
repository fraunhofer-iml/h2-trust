/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class AccountingPeriodPower {
  amount: number;
  time: Date;

  constructor(amount: number, time: Date) {
    this.amount = amount;
    this.time = time;
  }
}

export class AccountingPeriodHydrogen {
  amount: number;
  time: Date;
  power: number;

  constructor(amount: number, time: Date, power: number) {
    this.amount = amount;
    this.time = time;
    this.power = power;
  }
}
