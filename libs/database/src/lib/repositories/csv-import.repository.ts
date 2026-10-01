/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CsvDocumentEntity } from '@h2-trust/contracts/entities';
import { CsvContentType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { PrismaService } from '../prisma.service';
import { wrapPrismaError } from './prisma-error.wrapper';

export interface CreateCsvDocumentInput {
  fileName: string;
  type: string;
  startedAt: Date;
  endedAt: Date;
  amount: number;
  unitId: string;
}

const csvDocumentWithUploaderInclude = {
  csvImport: {
    include: {
      uploadedBy: {
        include: {
          company: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class CsvImportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async saveCsvImport(uploadedById: string, tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx ?? this.prismaService;
    const csvImport = await client.csvImport.create({ data: { uploadedById } }).catch(wrapPrismaError);

    return csvImport.id;
  }

  async saveCsvDocuments(
    csvImportId: string,
    inputs: CreateCsvDocumentInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<CsvDocumentEntity[]> {
    const client = tx ?? this.prismaService;
    const documents = await client.csvDocument
      .createManyAndReturn({
        data: inputs.map((input) => ({
          fileName: input.fileName,
          type: input.type,
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          amount: input.amount,
          unitId: input.unitId,
          csvImportId,
        })),
      })
      .catch(wrapPrismaError);

    return documents.map(CsvDocumentEntity.fromDatabase);
  }

  async findAllCsvDocumentsByCompanyId(companyId: string): Promise<CsvDocumentEntity[]> {
    const ownUploadFilter = { csvImport: { uploadedBy: { companyId } } };

    const ppaPowerUploadFilter = {
      type: CsvContentType.POWER,
      unit: {
        powerPurchaseAgreements: {
          some: {
            hydrogenProducerId: companyId,
            status: PowerPurchaseAgreementStatus.APPROVED,
          },
        },
      },
    };

    const documents = await this.prismaService.csvDocument
      .findMany({
        where: {
          OR: [ownUploadFilter, ppaPowerUploadFilter],
        },
        include: csvDocumentWithUploaderInclude,
      })
      .catch(wrapPrismaError);

    return documents.map(CsvDocumentEntity.fromDatabase);
  }

  async updateTransactionHash(
    csvDocumentIds: string[],
    transactionHash: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;
    await client.csvDocument
      .updateMany({ where: { id: { in: csvDocumentIds } }, data: { transactionHash } })
      .catch(wrapPrismaError);
  }

  async findCsvDocumentById(id: string): Promise<CsvDocumentEntity | null> {
    const document = await this.prismaService.csvDocument
      .findUnique({ where: { id }, include: csvDocumentWithUploaderInclude })
      .catch(wrapPrismaError);

    return document ? CsvDocumentEntity.fromDatabase(document) : null;
  }
}
