/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { VerifyCsvDocumentIntegrityResultEntity } from '@h2-trust/amqp';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';

export class VerifyCsvDocumentIntegrityDto {
  @IsString()
  @IsNotEmpty()
  documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
  }
}

export class VerifyCsvDocumentIntegrityResultDto {
  documentId: string;
  fileName: string;
  status: CsvDocumentIntegrityStatus;
  message: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: Date;
  network: string;
  smartContractAddress: string;
  explorerUrl: string;

  constructor(
    documentId: string,
    fileName: string,
    status: CsvDocumentIntegrityStatus,
    message: string,
    transactionHash: string,
    blockNumber: number,
    blockTimestamp: Date,
    network: string,
    smartContractAddress: string,
    explorerUrl: string,
  ) {
    this.documentId = documentId;
    this.fileName = fileName;
    this.status = status;
    this.message = message;
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.blockTimestamp = blockTimestamp;
    this.network = network;
    this.smartContractAddress = smartContractAddress;
    this.explorerUrl = explorerUrl;
  }

  static fromEntity(entity: VerifyCsvDocumentIntegrityResultEntity): VerifyCsvDocumentIntegrityResultDto {
    return new VerifyCsvDocumentIntegrityResultDto(
      entity.documentId,
      entity.fileName,
      entity.status,
      entity.message,
      entity.transactionHash,
      entity.blockNumber,
      entity.blockTimestamp,
      entity.network,
      entity.smartContractAddress,
      entity.explorerUrl,
    );
  }
}
