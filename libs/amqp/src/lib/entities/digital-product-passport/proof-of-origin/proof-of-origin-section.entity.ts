/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginBatchEntity } from './proof-of-origin-batch.entity';
import { ProofOfOriginClassificationEntity } from './proof-of-origin-classification.entity';

export class ProofOfOriginSectionEntity {
  name: string;
  batches: ProofOfOriginBatchEntity[];
  classifications: ProofOfOriginClassificationEntity[];

  constructor(
    name: string,
    batches: ProofOfOriginBatchEntity[] = [],
    classifications: ProofOfOriginClassificationEntity[] = [],
  ) {
    this.name = name;
    this.batches = batches;
    this.classifications = classifications;
  }
}
