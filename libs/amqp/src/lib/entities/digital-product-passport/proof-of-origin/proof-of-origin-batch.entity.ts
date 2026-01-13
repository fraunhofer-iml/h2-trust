/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../../bottling';
import { ProofOfOriginEmission } from './proof-of-origin-emission.entity';

interface BaseBatch {
  id: string;
  emission: ProofOfOriginEmission;
  createdAt: Date;
  amount: number;
  unit: string;
}

export interface HydrogenBatch extends BaseBatch {
  batchType: BatchType.HYDROGEN;
  hydrogenComposition: HydrogenComponentEntity[];
  producer?: string;
  unitId?: string;
  color?: string;
  processStep?: string;
  accountingPeriodEnd?: Date;
}

export interface PowerBatch extends BaseBatch {
  batchType: BatchType.POWER;
  producer: string;
  unitId: string;
  energySource: EnergySource;
  accountingPeriodEnd: Date;
}

export interface WaterBatch extends BaseBatch {
  batchType: BatchType.WATER;
  deionizedWaterAmount: number;
  deionizedWaterEmission: ProofOfOriginEmission;
}

export type ProofOfOriginBatch = HydrogenBatch | PowerBatch | WaterBatch;
