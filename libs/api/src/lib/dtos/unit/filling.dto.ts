/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class FillingDto {
  id: string;
  color: string;
  amount: number;

  constructor(id: string, color: string, amount: number) {
    this.id = id;
    this.color = color;
    this.amount = amount;
  }
}
