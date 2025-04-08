/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from '@prisma/client';
import {
  Addresses,
  Batches,
  Companies,
  Documents,
  ElectrolysisTypes,
  EnergySources,
  HydrogenProductionUnits,
  HydrogenStorageUnits,
  PowerAccessApprovals,
  PowerProductionUnits,
  PowerProductionUnitTypes,
  ProcessSteps,
  ProcessTypes,
  Units,
  Users,
} from './data';
import { Data, importData } from './data-importer';

const data: Data[] = [
  {
    name: 'address',
    records: Addresses,
    createRecord: async (data: any) => await prisma.address.create({ data }),
  },
  {
    name: 'company',
    records: Companies,
    createRecord: async (data: any) => await prisma.company.create({ data }),
  },
  {
    name: 'user',
    records: Users,
    createRecord: async (data: any) => await prisma.user.create({ data }),
  },
  {
    name: 'unit',
    records: Units,
    createRecord: async (data: any) => await prisma.unit.create({ data }),
  },
  {
    name: 'powerProductionUnitType',
    records: PowerProductionUnitTypes,
    createRecord: async (data: any) => await prisma.powerProductionUnitType.create({ data }),
  },
  {
    name: 'powerProductionUnit',
    records: PowerProductionUnits,
    createRecord: async (data: any) => await prisma.powerProductionUnit.create({ data }),
  },
  {
    name: 'electrolysisType',
    records: ElectrolysisTypes,
    createRecord: async (data: any) => await prisma.electrolysisType.create({ data }),
  },
  {
    name: 'hydrogenStorageUnit',
    records: HydrogenStorageUnits,
    createRecord: async (data: any) => await prisma.hydrogenStorageUnit.create({ data }),
  },
  {
    name: 'hydrogenProductionUnit',
    records: HydrogenProductionUnits,
    createRecord: async (data: any) => await prisma.hydrogenProductionUnit.create({ data }),
  },
  {
    name: 'batch',
    records: Batches,
    createRecord: async (data: any) => await prisma.batch.create({ data }),
  },
  {
    name: 'processTypes',
    records: ProcessTypes,
    createRecord: async (data: any) => await prisma.processType.create({ data }),
  },
  {
    name: 'processStep',
    records: ProcessSteps,
    createRecord: async (data: any) => await prisma.processStep.create({ data }),
  },
  {
    name: 'document',
    records: Documents,
    createRecord: async (data: any) => await prisma.document.create({ data }),
  },
  {
    name: 'energySource',
    records: EnergySources,
    createRecord: async (data: any) => await prisma.energySource.create({ data }),
  },
  {
    name: 'powerAccessApproval',
    records: PowerAccessApprovals,
    createRecord: async (data: any) => await prisma.powerAccessApproval.create({ data }),
  },
];

const prisma = new PrismaClient();

importData(data)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('### Error during data import:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
