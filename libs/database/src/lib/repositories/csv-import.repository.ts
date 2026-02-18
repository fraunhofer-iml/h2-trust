/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CsvDocumentEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

export interface CreateCsvDocumentInput {
  fileName: string;
  type: string;
  startedAt: Date;
  endedAt: Date;
  amount: number;
}

@Injectable()
export class CsvImportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createCsvImport(uploadedById: string, tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx ?? this.prismaService;

    const csvImport = await client.csvImport.create({
      data: { uploadedById },
    });

    return csvImport.id;
  }

  async createCsvDocuments(
    csvImportId: string,
    inputs: CreateCsvDocumentInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<CsvDocumentEntity[]> {
    const client = tx ?? this.prismaService;

    const documents = await client.csvDocument.createManyAndReturn({
      data: inputs.map((input) => ({
        fileName: input.fileName,
        type: input.type,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        amount: input.amount,
        csvImportId,
      })),
    });

    return documents.map(CsvDocumentEntity.fromDatabase);
  }

  async findAllCsvDocumentsByCompanyId(companyId: string): Promise<CsvDocumentEntity[]> {
    const documents = await this.prismaService.csvDocument.findMany({
      where: {
        csvImport: {
          uploadedBy: {
            companyId,
          },
        },
      },
    });

    return documents.map(CsvDocumentEntity.fromDatabase);
  }

  async updateTransactionHash(
    csvDocumentIds: string[],
    transactionHash: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.csvDocument.updateMany({
      where: { id: { in: csvDocumentIds } },
      data: { transactionHash },
    });
  }

  async findCsvDocumentById(id: string): Promise<CsvDocumentEntity | null> {
    const document = await this.prismaService.csvDocument.findUnique({
      where: { id },
    });

    return document ? CsvDocumentEntity.fromDatabase(document) : null;
  }
}
