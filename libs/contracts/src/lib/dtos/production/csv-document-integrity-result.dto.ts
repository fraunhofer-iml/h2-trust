/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerifyCsvDocumentIntegrityResultEntity } from '@h2-trust/contracts/entities';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';

export class CsvDocumentIntegrityResultDto {
  documentId: string;
  fileName: string | null;
  status: CsvDocumentIntegrityStatus;
  message: string;
  transactionHash: string | null;
  blockNumber: number | null;
  blockTimestamp: Date | null;
  network: string | null;
  smartContractAddress: string | null;
  blockchainExplorerUrl: string | null;
  cid: string | null;
  ipfsExplorerUrl: string | null;

  constructor(
    documentId: string,
    fileName: string | null,
    status: CsvDocumentIntegrityStatus,
    message: string,
    transactionHash: string | null,
    blockNumber: number | null,
    blockTimestamp: Date | null,
    network: string | null,
    smartContractAddress: string | null,
    blockchainExplorerUrl: string | null,
    cid: string | null,
    ipfsExplorerUrl: string | null,
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
    this.blockchainExplorerUrl = blockchainExplorerUrl;
    this.cid = cid;
    this.ipfsExplorerUrl = ipfsExplorerUrl;
  }

  static fromEntity(entity: VerifyCsvDocumentIntegrityResultEntity): CsvDocumentIntegrityResultDto {
    return new CsvDocumentIntegrityResultDto(
      entity.documentId,
      entity.fileName,
      entity.status,
      entity.message,
      entity.transactionHash,
      entity.blockNumber,
      entity.blockTimestamp,
      entity.network,
      entity.smartContractAddress,
      entity.blockchainExplorerUrl,
      entity.cid,
      entity.ipfsExplorerUrl,
    );
  }
}
