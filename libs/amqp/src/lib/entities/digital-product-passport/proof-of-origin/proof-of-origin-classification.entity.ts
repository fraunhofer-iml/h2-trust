/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType } from '@h2-trust/domain';
import { ProofOfOriginBatch } from './proof-of-origin-batch.entity';

/**
 * A top-level classification within a section.
 * Can contain either batches directly or sub-classifications (but not nested recursively).
 */
export class ProofOfOriginClassificationEntity {
  name: string;
  emissionOfProcessStep: number;
  amount: number;
  batches: ProofOfOriginBatch[];
  subClassifications: SubClassification[];
  unit: string;
  classificationType: BatchType;

  constructor(
    name: string,
    emissionOfProcessStep: number,
    amount: number,
    unit: string,
    classificationType: BatchType,
    batches: ProofOfOriginBatch[] = [],
    subClassifications: SubClassification[] = [],
  ) {
    this.name = name;
    this.emissionOfProcessStep = emissionOfProcessStep;
    this.amount = amount;
    this.batches = batches;
    this.subClassifications = subClassifications;
    this.unit = unit;
    this.classificationType = classificationType;
  }
}

/**
 * A leaf classification that contains batches but no further sub-classifications.
 * Used for grouping batches by a specific criterion (e.g., energy source, hydrogen color).
 */
export interface SubClassification {
  name: string;
  emissionOfProcessStep: number;
  amount: number;
  batches: ProofOfOriginBatch[];
  unit: string;
  classificationType: BatchType;
}