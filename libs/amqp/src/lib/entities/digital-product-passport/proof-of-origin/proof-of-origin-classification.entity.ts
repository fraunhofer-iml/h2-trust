/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType } from '@h2-trust/domain';
import { ProofOfOriginBatchEntity } from './proof-of-origin-batch.entity';

export class ProofOfOriginClassificationEntity {
  name: string;
  emissionOfProcessStep: number;
  amount: number;
  batches: ProofOfOriginBatchEntity[];
  classifications: ProofOfOriginClassificationEntity[];
  unit: string;
  classificationType: BatchType;

  constructor(
    name: string,
    emissionOfProcessStep: number,
    amount: number,
    unit: string,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[] = [],
    classifications: ProofOfOriginClassificationEntity[] = [],
  ) {
    this.name = name;
    this.emissionOfProcessStep = emissionOfProcessStep;
    this.amount = amount;
    this.batches = batches;
    this.classifications = classifications;
    this.unit = unit;
    this.classificationType = classificationType;
  }
}
