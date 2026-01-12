/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginBatchEntity } from './proof-of-origin-batch.entity';
import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';
import { ProofOfOriginWaterDetailsEntity } from './proof-of-origin-water-details.entity';

export class ProofOfOriginWaterBatchEntity extends ProofOfOriginBatchEntity {
  deionizedWater: ProofOfOriginWaterDetailsEntity;

  constructor(
    id: string,
    emission: ProofOfOriginEmissionEntity,
    createdAt: Date,
    amount: number,
    unit: string,
    deionizedWater: ProofOfOriginWaterDetailsEntity,
    batchType: string,
  ) {
    super(id, emission, createdAt, amount, unit, batchType);
    this.deionizedWater = deionizedWater;
  }
}
