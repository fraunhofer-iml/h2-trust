/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../../bottling';
import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';

export type ProofOfOriginBatchEntity =
  | ProofOfOriginPowerBatchEntity
  | ProofOfOriginWaterBatchEntity
  | ProofOfOriginHydrogenBatchEntity;

class ProofOfOriginBaseBatchEntity {
  id: string;
  emission: ProofOfOriginEmissionEntity;
  createdAt: Date;
  amount: number;
  unit: string;

  constructor(id: string, emission: ProofOfOriginEmissionEntity, createdAt: Date, amount: number, unit: string) {
    this.id = id;
    this.emission = emission;
    this.createdAt = createdAt;
    this.amount = amount;
    this.unit = unit;
  }
}

export class ProofOfOriginPowerBatchEntity extends ProofOfOriginBaseBatchEntity {
  batchType: BatchType = BatchType.POWER;
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
  ) {
    super(id, emission, createdAt, amount, unit);
    this.producer = producer;
    this.unitId = unitId;
    this.energySource = energySource;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}

export class ProofOfOriginWaterBatchEntity extends ProofOfOriginBaseBatchEntity {
  batchType: BatchType = BatchType.WATER;
  deionizedWaterAmount: number;
  deionizedWaterEmission: ProofOfOriginEmissionEntity;

  constructor(
    id: string,
    emission: ProofOfOriginEmissionEntity,
    createdAt: Date,
    amount: number,
    unit: string,
    deionizedWaterAmount: number,
    deionizedWaterEmission: ProofOfOriginEmissionEntity,
  ) {
    super(id, emission, createdAt, amount, unit);
    this.deionizedWaterAmount = deionizedWaterAmount;
    this.deionizedWaterEmission = deionizedWaterEmission;
  }
}

export class ProofOfOriginHydrogenBatchEntity extends ProofOfOriginBaseBatchEntity {
  batchType: BatchType = BatchType.HYDROGEN;
  hydrogenComposition: HydrogenComponentEntity[];
  producer?: string;
  unitId?: string;
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
    producer?: string,
    unitId?: string,
    color?: string,
    processStep?: string,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, createdAt, amount, unit);
    this.hydrogenComposition = hydrogenComposition;
    this.producer = producer;
    this.unitId = unitId;
    this.color = color;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
