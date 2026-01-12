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
  amountVerified?: number;
  producer?: string;
  unitId?: string;
  purity?: number;
  typeOfProduction?: string;
  hydrogenComposition: HydrogenComponentEntity[];
  color?: string;
  rfnboReady?: boolean;
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
    amountVerified?: number,
    producer?: string,
    unitId?: string,
    purity?: number,
    typeOfProduction?: string,
    color?: string,
    rfnboReady?: boolean,
    processStep?: string,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, createdAt, amount, unit, batchType);
    this.amountVerified = amountVerified;
    this.producer = producer;
    this.unitId = unitId;
    this.purity = purity;
    this.typeOfProduction = typeOfProduction;
    this.hydrogenComposition = hydrogenComposition;
    this.color = color;
    this.rfnboReady = rfnboReady;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
