/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from '@prisma/client';
import {
  AddressSeed,
  BatchDetailsSeed,
  BatchRelationBottlingProductionSeed,
  BatchRelationPowerHydrogenSeed,
  BatchRelationTransportationBottlingSeed,
  BatchRelationWaterHydrogenSeed,
  BatchSeed,
  CompanySeed,
  DecisionSeed,
  DocumentSeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageUnitSeed,
  PowerProductionTypeSeed,
  PowerProductionUnitSeed,
  PowerPurchaseAgreementSeed,
  ProcessStepDetailsSeed,
  ProcessStepSeed,
  QualityDetailsSeed,
  TransportationDetailsSeed,
  UnitSeed,
  UserSeed,
} from './data';
import { Data, importData } from './data-importer';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const data: Data[] = [
    {
      name: 'address',
      records: AddressSeed,
      createRecord: (data: any) => prisma.address.create({ data }),
    },
    {
      name: 'company',
      records: CompanySeed,
      createRecord: (data: any) => prisma.company.create({ data }),
    },
    {
      name: 'user',
      records: UserSeed,
      createRecord: (data: any) => prisma.user.create({ data }),
    },
    {
      name: 'unit',
      records: UnitSeed,
      createRecord: (data: any) => prisma.unit.create({ data }),
    },
    {
      name: 'powerProductionType',
      records: PowerProductionTypeSeed,
      createRecord: (data: any) => prisma.powerProductionType.create({ data }),
    },
    {
      name: 'powerProductionUnit',
      records: PowerProductionUnitSeed,
      createRecord: (data: any) => prisma.powerProductionUnit.create({ data }),
    },
    {
      name: 'hydrogenStorageUnit',
      records: HydrogenStorageUnitSeed,
      createRecord: (data: any) => prisma.hydrogenStorageUnit.create({ data }),
    },
    {
      name: 'hydrogenProductionUnit',
      records: HydrogenProductionUnitSeed,
      createRecord: (data: any) => prisma.hydrogenProductionUnit.create({ data }),
    },
    {
      name: 'batch',
      records: BatchSeed,
      createRecord: (data: any) => prisma.batch.create({ data }),
    },
    {
      name: 'batchRelationPowerHydrogen',
      records: BatchRelationPowerHydrogenSeed,
      createRecord: (data: any) =>
        prisma.batch.update({
          where: { id: data.A },
          data: {
            predecessors: {
              connect: { id: data.B },
            },
          },
        }),
    },
    {
      name: 'batchRelationWaterHydrogen',
      records: BatchRelationWaterHydrogenSeed,
      createRecord: (data: any) =>
        prisma.batch.update({
          where: { id: data.A },
          data: {
            predecessors: {
              connect: { id: data.B },
            },
          },
        }),
    },
    {
      name: 'batchRelationBottlingProduction',
      records: BatchRelationBottlingProductionSeed,
      createRecord: (data: any) =>
        prisma.batch.update({
          where: { id: data.A },
          data: {
            predecessors: {
              connect: { id: data.B },
            },
          },
        }),
    },
    {
      name: 'batchRelationTransportationBottling',
      records: BatchRelationTransportationBottlingSeed,
      createRecord: (data: any) =>
        prisma.batch.update({
          where: { id: data.A },
          data: {
            predecessors: {
              connect: { id: data.B },
            },
          },
        }),
    },
    {
      name: 'batchDetails',
      records: BatchDetailsSeed,
      createRecord: (data: any) => prisma.batchDetails.create({ data }),
    },
    {
      name: 'qualityDetails',
      records: QualityDetailsSeed,
      createRecord: (data: any) => prisma.qualityDetails.create({ data }),
    },
    {
      name: 'processStep',
      records: ProcessStepSeed,
      createRecord: (data: any) => prisma.processStep.create({ data }),
    },
    {
      name: 'processStepDetails',
      records: ProcessStepDetailsSeed,
      createRecord: (data: any) => prisma.processStepDetails.create({ data }),
    },
    {
      name: 'transportationDetails',
      records: TransportationDetailsSeed,
      createRecord: (data: any) => prisma.transportationDetails.create({ data }),
    },
    {
      name: 'document',
      records: DocumentSeed,
      createRecord: (data: any) => prisma.document.create({ data }),
    },
    {
      name: 'powerPurchaseAgreement',
      records: PowerPurchaseAgreementSeed,
      createRecord: (data: any) => prisma.powerPurchaseAgreement.create({ data }),
    },
    {
      name: 'decision',
      records: DecisionSeed,
      createRecord: async (data: any) => await prisma.decision.create({ data }),
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
