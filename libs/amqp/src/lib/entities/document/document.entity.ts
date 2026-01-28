/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentDbType } from '@h2-trust/database';

export class DocumentEntity {
  id: string;
  fileName: string;
  transactionHash?: string;
  storageUrl?: string;

  constructor(id: string, fileName: string, transactionHash?: string, storageUrl?: string) {
    this.id = id;
    this.fileName = fileName;
    this.transactionHash = transactionHash;
    this.storageUrl = storageUrl;
  }

  static fromDatabase(document: DocumentDbType): DocumentEntity {
    return new DocumentEntity(document.id, document.fileName, document.transactionHash ?? undefined);
  }
}
