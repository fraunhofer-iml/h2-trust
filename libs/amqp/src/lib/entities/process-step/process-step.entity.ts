/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepDeepDbType, ProcessStepShallowDbType } from '@h2-trust/database';
import { BatchEntity } from '../batch';
import { DocumentEntity } from '../document';
import { BaseUnitEntity } from '../unit';
import { UserEntity } from '../user';
import { TransportationDetailsEntity } from './transportation-details.entity';

export class ProcessStepEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  type: string;
  batch: BatchEntity;
  recordedBy: UserEntity;
  executedBy: BaseUnitEntity;
  documents?: DocumentEntity[];
  transportationDetails?: TransportationDetailsEntity;

  constructor(
    id: string | undefined,
    startedAt: Date,
    endedAt: Date,
    type: string,
    batch: BatchEntity,
    recordedBy: UserEntity,
    executedBy: BaseUnitEntity,
    documents?: DocumentEntity[],
    transportationDetails?: TransportationDetailsEntity,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.type = type;
    this.batch = batch;
    this.recordedBy = recordedBy;
    this.executedBy = executedBy;
    this.documents = documents;
    this.transportationDetails = transportationDetails;
  }

  static fromShallowDatabase(processStep: ProcessStepShallowDbType): ProcessStepEntity {
    return new ProcessStepEntity(
      processStep.id,
      processStep.startedAt,
      processStep.endedAt,
      processStep.type,
      BatchEntity.fromSurfaceDatabase(processStep.batch),
      UserEntity.fromSurfaceDatabase(processStep.recordedBy),
      BaseUnitEntity.fromSurfaceDatabase(processStep.executedBy),
      processStep.documents.map((doc) => DocumentEntity.fromDatabase(doc)),
      processStep.processStepDetails?.transportationDetails
        ? TransportationDetailsEntity.fromDatabase(processStep.processStepDetails.transportationDetails)
        : undefined,
    );
  }

  static fromDeepDatabase(processStep: ProcessStepDeepDbType): ProcessStepEntity {
    return new ProcessStepEntity(
      processStep.id,
      processStep.startedAt,
      processStep.endedAt,
      processStep.type,
      BatchEntity.fromShallowDatabase(processStep.batch),
      UserEntity.fromShallowDatabase(processStep.recordedBy),
      BaseUnitEntity.fromSurfaceDatabase(processStep.executedBy),
      processStep.documents.map((doc) => DocumentEntity.fromDatabase(doc)),
      processStep.processStepDetails?.transportationDetails
        ? TransportationDetailsEntity.fromDatabase(processStep.processStepDetails.transportationDetails)
        : undefined,
    );
  }
}
