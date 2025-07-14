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
  BatchesSeed,
  BatchRelationPowerHydrogenSeed,
  BatchRelationHydrogenHydrogen,
  CompaniesSeed,
  DocumentsSeed,
  ElectrolysisTypesSeed,
  HydrogenProductionUnitsSeed,
  HydrogenStorageUnitsSeed,
  PowerAccessApprovalsSeed,
  PowerProductionUnitsSeed,
  PowerProductionUnitTypesSeed,
  ProcessStepsSeed,
  ProcessTypesSeed,
  UnitsSeed,
  UsersSeed,
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
      records: CompaniesSeed,
      createRecord: async (data: any) => await prisma.company.create({ data }),
    },
    {
      name: 'user',
      records: UsersSeed,
      createRecord: async (data: any) => await prisma.user.create({ data }),
    },
    {
      name: 'unit',
      records: UnitsSeed,
      createRecord: async (data: any) => await prisma.unit.create({ data }),
    },
    {
      name: 'powerProductionUnitType',
      records: PowerProductionUnitTypesSeed,
      createRecord: async (data: any) => await prisma.powerProductionUnitType.create({ data }),
    },
    {
      name: 'powerProductionUnit',
      records: PowerProductionUnitsSeed,
      createRecord: async (data: any) => await prisma.powerProductionUnit.create({ data }),
    },
    {
      name: 'electrolysisType',
      records: ElectrolysisTypesSeed,
      createRecord: async (data: any) => await prisma.electrolysisType.create({ data }),
    },
    {
      name: 'hydrogenStorageUnit',
      records: HydrogenStorageUnitsSeed,
      createRecord: async (data: any) => await prisma.hydrogenStorageUnit.create({ data }),
    },
    {
      name: 'hydrogenProductionUnit',
      records: HydrogenProductionUnitsSeed,
      createRecord: async (data: any) => await prisma.hydrogenProductionUnit.create({ data }),
    },
    {
      name: 'batch',
      records: BatchesSeed,
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
      name: 'batchRelationHydrogenHydrogen',
      records: BatchRelationHydrogenHydrogen,
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
      name: 'processTypes',
      records: ProcessTypesSeed,
      createRecord: async (data: any) => await prisma.processType.create({ data }),
    },
    {
      name: 'processStep',
      records: ProcessStepsSeed,
      createRecord: async (data: any) => await prisma.processStep.create({ data }),
    },
    {
      name: 'document',
      records: DocumentsSeed,
      createRecord: async (data: any) => await prisma.document.create({ data }),
    },
    {
      name: 'powerAccessApproval',
      records: PowerAccessApprovalsSeed,
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
