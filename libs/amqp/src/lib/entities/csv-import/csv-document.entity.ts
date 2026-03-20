/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvDocumentDbType } from '@h2-trust/database';

export class CsvDocumentEntity {
  id: string;
  fileName: string;
  type: string;
  startedAt: Date;
  endedAt: Date;
  amount: number;
  transactionHash?: string;

  constructor(
    id: string,
    fileName: string,
    type: string,
    startedAt: Date,
    endedAt: Date,
    amount: number,
    transactionHash?: string,
  ) {
    this.id = id;
    this.fileName = fileName;
    this.type = type;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amount = amount;
    this.transactionHash = transactionHash;
  }

  static fromDatabase(csvDocument: CsvDocumentDbType): CsvDocumentEntity {
    return new CsvDocumentEntity(
      csvDocument.id,
      csvDocument.fileName,
      csvDocument.type,
      csvDocument.startedAt,
      csvDocument.endedAt,
      Number(csvDocument.amount),
      csvDocument.transactionHash ?? undefined,
    );
  }
}
