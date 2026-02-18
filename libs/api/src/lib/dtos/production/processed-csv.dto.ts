/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvDocumentEntity } from '@h2-trust/amqp';
import { CsvContentType } from '../../types';

export class ProcessedCsvDto {
  id: string;
  url: string;
  name: string;
  uploadedBy: string; // company name
  startedAt: Date;
  endedAt: Date;
  csvContentType: CsvContentType;
  amount: number;
  verifiable: boolean;

  constructor(
    id: string,
    url: string,
    name: string,
    uploadedBy: string,
    startedAt: Date,
    endedAt: Date,
    csvContentType: CsvContentType,
    amount: number,
    verifiable: boolean,
  ) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.uploadedBy = uploadedBy;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.csvContentType = csvContentType;
    this.amount = amount;
    this.verifiable = verifiable;
  }

  static fromEntity(entity: CsvDocumentEntity, minioUrl: string, companyName: string): ProcessedCsvDto {
    return new ProcessedCsvDto(
      entity.id,
      `${minioUrl}/${entity.fileName}`,
      entity.fileName,
      companyName,
      entity.startedAt,
      entity.endedAt,
      entity.type as CsvContentType,
      entity.amount,
      Boolean(entity.transactionHash),
    );
  }
}
