/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDbType } from '@h2-trust/database';
import { CompanyEntity } from '../company';
import { HydrogenStorageUnitEntity } from '../unit';
import { QualityDetailsEntity } from './quality-details.entity';

export class BatchEntity {
  id?: string;
  active?: boolean;
  amount?: number;
  type?: string;
  predecessors?: BatchEntity[];
  successors?: BatchEntity[];
  owner?: CompanyEntity;
  hydrogenStorageUnit?: HydrogenStorageUnitEntity;
  qualityDetails?: QualityDetailsEntity;
  processStepId?: string;

  constructor(
    id: string,
    active: boolean,
    amount: number,
    type: string,
    predecessors: BatchEntity[],
    successors: BatchEntity[],
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

  static fromDatabase(batch: BatchDbType): BatchEntity {
    return <BatchEntity>{
      id: batch.id,
      active: batch.active,
      amount: batch.amount.toNumber(),
      type: batch.type,
      predecessors: batch.predecessors.map((pred) =>
        BatchEntity.fromDatabase({ ...pred, predecessors: [], successors: [] }),
      ),
      successors: batch.successors.map((succ) =>
        BatchEntity.fromDatabase({ ...succ, predecessors: [], successors: [] }),
      ),
      owner: CompanyEntity.fromDatabase(batch.owner),
      hydrogenStorageUnit: {
        id: batch.hydrogenStorageUnit?.generalInfo.id,
        name: batch.hydrogenStorageUnit?.generalInfo?.name,
      },
      qualityDetails: batch.batchDetails?.qualityDetails
        ? QualityDetailsEntity.fromDatabase(batch.batchDetails.qualityDetails)
        : undefined,
      processStepId: batch.processStep?.id,
    };
  }
}
