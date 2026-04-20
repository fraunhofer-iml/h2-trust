/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepDeepDbType } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { ConcreteUnitEntity } from '../../../../../amqp/src/lib/types';
import { BatchEntity } from '../batch';
import { DocumentEntity } from '../document';
import { getSpecificUnit } from '../unit/unit.factory';
import { UserEntity } from '../user';
import { TransportationDetailsEntity } from './transportation-details.entity';

export class ProcessStepEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  type: ProcessType;
  batch: BatchEntity;
  recordedBy: UserEntity;
  executedBy: ConcreteUnitEntity;
  documents?: DocumentEntity[];
  transportationDetails?: TransportationDetailsEntity;

  constructor(
    id: string | undefined,
    startedAt: Date,
    endedAt: Date,
    type: ProcessType,
    batch: BatchEntity,
    recordedBy: UserEntity,
    executedBy: ConcreteUnitEntity,
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

  static fromDeepDatabase(processStep: ProcessStepDeepDbType): ProcessStepEntity {
    assertValidEnum(processStep.type, ProcessType, 'ProcessType');
    return new ProcessStepEntity(
      processStep.id,
      processStep.startedAt,
      processStep.endedAt,
      processStep.type,
      BatchEntity.fromNestedDatabase(processStep.batch),
      UserEntity.fromNestedDatabase(processStep.recordedBy),
      getSpecificUnit(processStep.executedBy),
      processStep.documents.map((doc) => DocumentEntity.fromDatabase(doc)),
      processStep.processStepDetails?.transportationDetails
        ? TransportationDetailsEntity.fromDatabase(processStep.processStepDetails.transportationDetails)
        : undefined,
    );
  }
}
