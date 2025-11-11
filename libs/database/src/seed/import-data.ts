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
  BatchSeed,
  CompanySeed,
  DocumentSeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageUnitSeed,
  PowerAccessApprovalSeed,
  PowerProductionTypeSeed,
  PowerProductionUnitSeed,
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
      createRecord: async (data: any) => await prisma.address.create({ data }),
    },
    {
      name: 'company',
      records: CompanySeed,
      createRecord: async (data: any) => await prisma.company.create({ data }),
    },
    {
      name: 'user',
      records: UserSeed,
      createRecord: async (data: any) => await prisma.user.create({ data }),
    },
    {
      name: 'unit',
      records: UnitSeed,
      createRecord: async (data: any) => await prisma.unit.create({ data }),
    },
    {
      name: 'powerProductionType',
      records: PowerProductionTypeSeed,
      createRecord: async (data: any) => await prisma.powerProductionType.create({ data }),
    },
    {
      name: 'powerProductionUnit',
      records: PowerProductionUnitSeed,
      createRecord: async (data: any) => await prisma.powerProductionUnit.create({ data }),
    },
    {
      name: 'hydrogenStorageUnit',
      records: HydrogenStorageUnitSeed,
      createRecord: async (data: any) => await prisma.hydrogenStorageUnit.create({ data }),
    },
    {
      name: 'hydrogenProductionUnit',
      records: HydrogenProductionUnitSeed,
      createRecord: async (data: any) => await prisma.hydrogenProductionUnit.create({ data }),
    },
    {
      name: 'batch',
      records: BatchSeed,
      createRecord: async (data: any) => await prisma.batch.create({ data }),
    },
    {
      name: 'batchRelationPowerHydrogen',
      records: BatchRelationPowerHydrogenSeed,
      createRecord: async (data: any) =>
        await prisma.batch.update({
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
      createRecord: async (data: any) =>
        await prisma.batch.update({
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
      createRecord: async (data: any) =>
        await prisma.batch.update({
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
      createRecord: async (data: any) => await prisma.batchDetails.create({ data }),
    },
    {
      name: 'qualityDetails',
      records: QualityDetailsSeed,
      createRecord: async (data: any) => await prisma.qualityDetails.create({ data }),
    },
    {
      name: 'processStep',
      records: ProcessStepSeed,
      createRecord: async (data: any) => await prisma.processStep.create({ data }),
    },
    {
      name: 'processStepDetails',
      records: ProcessStepDetailsSeed,
      createRecord: async (data: any) => await prisma.processStepDetails.create({ data }),
    },
    {
      name: 'transportationDetails',
      records: TransportationDetailsSeed,
      createRecord: async (data: any) => await prisma.transportationDetails.create({ data }),
    },
    {
      name: 'document',
      records: DocumentSeed,
      createRecord: async (data: any) => await prisma.document.create({ data }),
    },
    {
      name: 'powerAccessApproval',
      records: PowerAccessApprovalSeed,
      createRecord: async (data: any) => await prisma.powerAccessApproval.create({ data }),
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
