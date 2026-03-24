/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountingPeriodHydrogen, AccountingPeriodPower, BatchEntity, UnitAccountingPeriods } from '@h2-trust/amqp';
import { BatchType, ProcessType } from '@h2-trust/domain';

export interface AccountingPeriod {
  startedAt: Date;
  endedAt: Date;
  amount: number;
  predecessors: BatchEntity[];
}

export interface BatchParams {
  activity: boolean;
  type: BatchType;
  owner: string;
  quality?: string;
  hydrogenStorageUnitId?: string;
}

export interface ProcessStepParams {
  type: ProcessType;
  executedBy: string;
  recordedBy: string;
  batchParams: BatchParams;
}

export interface DocumentProof {
  fileName: string;
  hash: string;
  cid: string;
}

export interface ParsedImport<T extends AccountingPeriodPower | AccountingPeriodHydrogen> extends DocumentProof {
  periods: UnitAccountingPeriods<T>;
  type: Exclude<BatchType, BatchType.WATER>;
}
