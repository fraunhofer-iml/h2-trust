/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessType, RfnboType } from '@h2-trust/domain';

export class BatchDto {
  id: string;
  amount: number;
  createdAt: Date;
  batchType: ProcessType;
  rfnboType: RfnboType;

  constructor(id: string, amount: number, createdAt: Date, batchType: ProcessType, rfnboType: RfnboType) {
    this.id = id;
    this.amount = amount;
    this.createdAt = createdAt;
    this.batchType = batchType;
    this.rfnboType = rfnboType;
  }
}
