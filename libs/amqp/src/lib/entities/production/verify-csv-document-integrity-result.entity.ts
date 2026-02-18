/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvDocumentIntegrityStatus } from "@h2-trust/domain";

export class VerifyCsvDocumentIntegrityResultEntity {
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
}