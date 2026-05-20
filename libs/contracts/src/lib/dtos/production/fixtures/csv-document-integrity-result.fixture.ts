/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvDocumentIntegrityResultDto } from '@h2-trust/contracts/dtos';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';

export const CsvDocumentIntegrityResultDtoFixture = {
  create: (overrides: Partial<CsvDocumentIntegrityResultDto> = {}): CsvDocumentIntegrityResultDto => ({
    documentId: overrides.documentId ?? 'document-1',
    fileName: overrides.fileName ?? 'production.csv',
    status: overrides.status ?? CsvDocumentIntegrityStatus.VERIFIED,
    message: overrides.message ?? 'Integrity verified',
    transactionHash: overrides.transactionHash ?? '0x123',
    blockNumber: overrides.blockNumber ?? 42,
    blockTimestamp: overrides.blockTimestamp ?? new Date('2025-04-07T16:00:00.000Z'),
    blockchainNetwork: overrides.blockchainNetwork ?? 'localnet',
    smartContractAddress: overrides.smartContractAddress ?? '0xabc',
    blockchainExplorerUrl: overrides.blockchainExplorerUrl ?? 'https://explorer.example.com/tx/0x123',
    cid: overrides.cid ?? 'bafyfixturecid',
    ipfsNetwork: overrides.ipfsNetwork ?? 'ipfs',
    ipfsExplorerUrl: overrides.ipfsExplorerUrl ?? 'https://ipfs.example.com/ipfs/bafyfixturecid',
  }),
} as const;