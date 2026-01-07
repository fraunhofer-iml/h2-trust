/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepDbType } from '@h2-trust/database';
import { BatchEntity } from '../batch';
import { DocumentEntity } from '../document';
import { BaseUnitEntity } from '../unit';
import { UserEntity } from '../user';
import { TransportationDetailsEntity } from './transportation-details.entity';

// TODO-MP: remove optionals...
export class ProcessStepEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  type?: string;
  batch?: BatchEntity | null;
  recordedBy?: UserEntity;
  executedBy?: BaseUnitEntity;
  documents?: DocumentEntity[];
  transportationDetails?: TransportationDetailsEntity;

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    type: string,
    batch: BatchEntity | null,
    recordedBy: UserEntity,
    executedBy: BaseUnitEntity,
    documents: DocumentEntity[],
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

  static fromDatabase(processStep: ProcessStepDbType): ProcessStepEntity {
    return new ProcessStepEntity(
      processStep.id,
      processStep.startedAt,
      processStep.endedAt,
      processStep.type,
      BatchEntity.fromDatabase(processStep.batch),
      UserEntity.fromDatabase(processStep.recordedBy),
      BaseUnitEntity.fromDatabase(processStep.executedBy),
      processStep.documents.map((doc) => DocumentEntity.fromDatabase(doc)),
      processStep.processStepDetails?.transportationDetails
        ? TransportationDetailsEntity.fromDatabase(processStep.processStepDetails.transportationDetails)
        : undefined,
    );
  }
}
