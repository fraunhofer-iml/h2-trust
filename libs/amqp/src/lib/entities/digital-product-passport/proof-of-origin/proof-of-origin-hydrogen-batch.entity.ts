/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '../../bottling';
import { ProofOfOriginBatchEntity } from './proof-of-origin-batch.entity';
import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';

export class ProofOfOriginHydrogenBatchEntity extends ProofOfOriginBatchEntity {
  producer?: string;
  unitId?: string;
  hydrogenComposition: HydrogenComponentEntity[];
  color?: string;
  processStep?: string;
  accountingPeriodEnd?: Date;

  constructor(
    id: string,
    emission: ProofOfOriginEmissionEntity,
    createdAt: Date,
    amount: number,
    unit: string,
    hydrogenComposition: HydrogenComponentEntity[],
    batchType: string,
    producer?: string,
    unitId?: string,
    color?: string,
    processStep?: string,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, createdAt, amount, unit, batchType);
    this.producer = producer;
    this.unitId = unitId;
    this.hydrogenComposition = hydrogenComposition;
    this.color = color;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
