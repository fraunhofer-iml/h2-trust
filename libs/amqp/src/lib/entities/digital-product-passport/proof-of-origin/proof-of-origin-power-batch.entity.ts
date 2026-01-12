/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnergySource } from '@h2-trust/domain';
import { ProofOfOriginBatchEntity } from './proof-of-origin-batch.entity';
import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';

export class ProofOfOriginPowerBatchEntity extends ProofOfOriginBatchEntity {
  producer: string;
  unitId: string;
  energySource: EnergySource;
  accountingPeriodEnd: Date;

  constructor(
    id: string,
    emission: ProofOfOriginEmissionEntity,
    createdAt: Date,
    amount: number,
    unit: string,
    producer: string,
    unitId: string,
    energySource: EnergySource,
    accountingPeriodEnd: Date,
    batchType: string,
  ) {
    super(id, emission, createdAt, amount, unit, batchType);
    this.producer = producer;
    this.unitId = unitId;
    this.energySource = energySource;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
