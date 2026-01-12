/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';

export abstract class ProofOfOriginBatchEntity {
  id: string;
  emission: ProofOfOriginEmissionEntity;
  createdAt: Date;
  amount: number;
  unit: string;
  batchType: string;

  protected constructor(
    id: string,
    emission: ProofOfOriginEmissionEntity,
    createdAt: Date,
    amount: number,
    unit: string,
    batchType: string,
  ) {
    this.id = id;
    this.emission = emission;
    this.createdAt = createdAt;
    this.amount = amount;
    this.unit = unit;
    this.batchType = batchType;
  }
}
