/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessType, RfnboType } from '@h2-trust/domain';

export enum ProcessStepOwnershipStatus {
  OWNED = 'OWNED',
  TRANSFERRED = 'TRANSFERRED',
}

export class ProcessStepActivity {
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
}
