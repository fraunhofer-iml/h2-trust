/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDeepDbType, BatchFlatDbType, BatchNestedDbType } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { CompanyEntity } from '../company';
import { HydrogenStorageUnitEntity } from '../unit';
import { QualityDetailsEntity } from './quality-details.entity';

export class BatchEntity {
  id?: string;
  active?: boolean;
  amount: number;
  type: BatchType;
  predecessors?: BatchEntity[];
  successors?: BatchEntity[];
  owner: CompanyEntity;
  hydrogenStorageUnit?: HydrogenStorageUnitEntity;
  qualityDetails?: QualityDetailsEntity;
  processStepId?: string;

  constructor(
    id: string | undefined,
    active: boolean | undefined,
    amount: number,
    type: BatchType,
    predecessors: BatchEntity[] | undefined,
    successors: BatchEntity[] | undefined,
    owner: CompanyEntity,
    hydrogenStorageUnit: HydrogenStorageUnitEntity | undefined,
    qualityDetails?: QualityDetailsEntity,
    processStepId?: string,
  ) {
    this.id = id;
    this.active = active;
    this.amount = amount;
    this.type = type;
    this.predecessors = predecessors;
    this.successors = successors;
    this.owner = owner;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.qualityDetails = qualityDetails;
    this.processStepId = processStepId;
  }

  static fromDeepDatabase(batch: BatchDeepDbType): BatchEntity {
    assertValidEnum(batch.type, BatchType);
    return new BatchEntity(
      batch.id,
      batch.active,
      batch.amount.toNumber(),
      batch.type as BatchType,
      batch.predecessors.map((pred) => BatchEntity.fromNestedDatabase({ ...pred, predecessors: [], successors: [] })),
      batch.successors.map((succ) => BatchEntity.fromNestedDatabase({ ...succ, predecessors: [], successors: [] })),
      CompanyEntity.fromNestedDatabase(batch.owner),
      batch.hydrogenStorageUnit
        ? HydrogenStorageUnitEntity.fromNestedHydrogenStorageUnit(batch.hydrogenStorageUnit)
        : undefined,
      batch.batchDetails?.qualityDetails
        ? QualityDetailsEntity.fromDatabase(batch.batchDetails.qualityDetails)
        : undefined,
      batch.processStep?.id,
    );
  }

  static fromNestedDatabase(batch: BatchNestedDbType): BatchEntity {
    assertValidEnum(batch.type, BatchType);
    return new BatchEntity(
      batch.id,
      batch.active,
      batch.amount.toNumber(),
      batch.type as BatchType,
      batch.predecessors.map((pred) => BatchEntity.fromFlatDatabase({ ...pred, predecessors: [], successors: [] })),
      batch.successors.map((succ) => BatchEntity.fromFlatDatabase({ ...succ, predecessors: [], successors: [] })),
      CompanyEntity.fromFlatDatabase(batch.owner),
      batch.hydrogenStorageUnit
        ? HydrogenStorageUnitEntity.fromNestedHydrogenStorageUnit(batch.hydrogenStorageUnit)
        : undefined,
      batch.batchDetails?.qualityDetails
        ? QualityDetailsEntity.fromDatabase(batch.batchDetails.qualityDetails)
        : undefined,
      batch.processStep?.id,
    );
  }

  static fromFlatDatabase(batch: BatchFlatDbType): BatchEntity {
    assertValidEnum(batch.type, BatchType);
    return new BatchEntity(
      batch.id,
      batch.active,
      batch.amount.toNumber(),
      batch.type as BatchType,
      [],
      [],
      CompanyEntity.fromBaseType(batch.owner),
      undefined,
      batch.batchDetails?.qualityDetails
        ? QualityDetailsEntity.fromDatabase(batch.batchDetails.qualityDetails)
        : undefined,
      batch.processStep?.id,
    );
  }
}
