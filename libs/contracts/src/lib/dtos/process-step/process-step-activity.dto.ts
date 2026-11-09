/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { ProcessType, RfnboType } from '@h2-trust/domain';

export enum ProcessStepOwnershipStatus {
  OWNED = 'OWNED',
  TRANSFERRED = 'TRANSFERRED',
}

export class ProcessStepActivityDto {
  processStepId: string;
  batchId: string;
  amount: number;
  createdAt: Date;
  processType: ProcessType;
  rfnboType: RfnboType;
  ownerName: string;
  ownershipStatus: ProcessStepOwnershipStatus;

  constructor(
    processStepId: string,
    batchId: string,
    amount: number,
    createdAt: Date,
    processType: ProcessType,
    rfnboType: RfnboType,
    ownerName: string,
    ownershipStatus: ProcessStepOwnershipStatus,
  ) {
    this.processStepId = processStepId;
    this.batchId = batchId;
    this.amount = amount;
    this.createdAt = createdAt;
    this.processType = processType;
    this.rfnboType = rfnboType;
    this.ownerName = ownerName;
    this.ownershipStatus = ownershipStatus;
  }

  static fromEntity(processStep: ProcessStepEntity, companyId: string): ProcessStepActivityDto {
    const ownershipStatus =
      processStep.batch.owner.id === companyId
        ? ProcessStepOwnershipStatus.OWNED
        : ProcessStepOwnershipStatus.TRANSFERRED;

    return new ProcessStepActivityDto(
      processStep.id ?? '',
      processStep.batch.id ?? '',
      processStep.batch.amount,
      processStep.startedAt,
      processStep.type,
      processStep.batch.details?.rfnboType ?? RfnboType.NOT_SPECIFIED,
      processStep.batch.owner.name,
      ownershipStatus,
    );
  }
}
