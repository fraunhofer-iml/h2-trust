/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RfnboType } from '@h2-trust/domain';

export class HydrogenComponentEntity {
  processId: string | null;
  amount: number;
  rfnboType: RfnboType;

  constructor(processId: string | null, amount: number, rfnboType: RfnboType) {
    this.processId = processId;
    this.amount = amount;
    this.rfnboType = rfnboType;
  }
}
