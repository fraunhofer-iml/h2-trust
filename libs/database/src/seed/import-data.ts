/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PrismaClient,
  type Address,
  type Batch,
  type Company,
  type Document,
  type PowerPurchaseAgreement,
  type PowerPurchaseAgreementDecision,
  type ProcessStep,
  type QualityDetails,
  type Unit,
  type User,
} from '@prisma/client';
import {
  AddressSeed,
  BatchRelationBottlingProductionSeed,
  BatchRelationPowerHydrogenSeed,
  BatchRelationTransportationBottlingSeed,
  BatchRelationWaterHydrogenSeed,
  BatchSeed,
  CompanySeed,
  DocumentSeed,
  PowerPurchaseAgreementDecisionSeed,
  PowerPurchaseAgreementSeed,
  ProcessStepSeed,
  QualityDetailsSeed,
  UnitSeed,
  UnitSpecificationSeed,
  UserSeed,
} from './data';
import { Data, importData } from './data-importer';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const data: Data[] = [
    {
      name: 'address',
      records: AddressSeed,
      createRecord: (data) => prisma.address.create({ data: data as Address }),
    },
    {
      name: 'company',
      records: CompanySeed,
      createRecord: (data) => prisma.company.create({ data: data as Company }),
    },
    {
      name: 'user',
      records: UserSeed,
      createRecord: (data) => prisma.user.create({ data: data as User }),
    },
    {
      name: 'unitSpecifications',
      records: UnitSpecificationSeed,
      createRecord: (data: any) => prisma.unitSpecification.create({ data }),
    },
    {
      name: 'unit',
      records: UnitSeed,
      createRecord: (data) => prisma.unit.create({ data: data as Unit }),
    },
    {
      name: 'batch',
      records: BatchSeed,
      createRecord: (data) => prisma.batch.create({ data: data as Batch }),
    },
    {
      name: 'batchRelationPowerHydrogen',
      records: BatchRelationPowerHydrogenSeed,
      createRecord: (data) => {
        const { A, B } = data as { A: string; B: string };
        return prisma.batch.update({
          where: { id: A },
          data: { predecessors: { connect: { id: B } } },
        });
      },
    },
    {
      name: 'batchRelationWaterHydrogen',
      records: BatchRelationWaterHydrogenSeed,
      createRecord: (data) => {
        const { A, B } = data as { A: string; B: string };
        return prisma.batch.update({
          where: { id: A },
          data: { predecessors: { connect: { id: B } } },
        });
      },
    },
    {
      name: 'batchRelationBottlingProduction',
      records: BatchRelationBottlingProductionSeed,
      createRecord: (data) => {
        const { A, B } = data as { A: string; B: string };
        return prisma.batch.update({
          where: { id: A },
          data: { predecessors: { connect: { id: B } } },
        });
      },
    },
    {
      name: 'batchRelationTransportationBottling',
      records: BatchRelationTransportationBottlingSeed,
      createRecord: (data) => {
        const { A, B } = data as { A: string; B: string };
        return prisma.batch.update({
          where: { id: A },
          data: { predecessors: { connect: { id: B } } },
        });
      },
    },
    {
      name: 'qualityDetails',
      records: QualityDetailsSeed,
      createRecord: (data) => prisma.qualityDetails.create({ data: data as QualityDetails }),
    },
    {
      name: 'processStep',
      records: ProcessStepSeed,
      createRecord: (data) => prisma.processStep.create({ data: data as ProcessStep }),
    },
    {
      name: 'document',
      records: DocumentSeed,
      createRecord: (data) => prisma.document.create({ data: data as Document }),
    },
    {
      name: 'powerPurchaseAgreement',
      records: PowerPurchaseAgreementSeed,
      createRecord: (data) => prisma.powerPurchaseAgreement.create({ data: data as PowerPurchaseAgreement }),
    },
    {
      name: 'powerPurchaseAgreementDecision',
      records: PowerPurchaseAgreementDecisionSeed,
      createRecord: (data) =>
        prisma.powerPurchaseAgreementDecision.create({ data: data as PowerPurchaseAgreementDecision }),
    },
  ];

  try {
    await importData(data);
    return { success: true };
  } catch (e) {
    console.error('### Error during data import:');
    console.error(e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

// Direct file execution
if (require.main === module) {
  seedDatabase().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
