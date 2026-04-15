/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor, RfnboType } from '@h2-trust/domain';

export class HydrogenComponentEntity {
  processId: string | null;
  color: HydrogenColor;
  amount: number;
  rfnboType: RfnboType;

  constructor(processId: string | null, color: HydrogenColor, amount: number, rfnboType: RfnboType) {
    this.processId = processId;
    this.color = color;
    this.amount = amount;
    this.rfnboType = rfnboType;
  }
}
