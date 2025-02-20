/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from '@prisma/client';
import { Data, importData } from './data-importer';

import { Addresses } from './data/addresses';
import { Companies } from './data/companies';
import { Users } from './data/users';
import { Documents } from './data/documents';
import { ProcessSteps } from './data/processSteps';
import { Processes } from './data/processes';
import { Assets } from './data/assets';
import { Batches } from './data/batches';
import { HydrogenStorageUnits } from './data/hydrogenStorageUnits';
import { HydrogenGenerationUnits } from './data/hydrogenGenerationUnits';
import { ElectrolysisTypes } from './data/electrolysisTypes';
import { PowerGenerationUnitTypes } from './data/powerGenerationUnitTypes';
import { PowerGenerationUnits } from './data/powerGenerationUnits';
import { EnergySources } from './data/energySources';
import { PowerAccessApprovals } from './data/powerAccessApprovals';

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
    name: 'asset',
    records: Assets,
    createRecord: async (data: any) => await prisma.asset.create({ data }),
  },
  {
    name: 'powerGenerationUnitType',
    records: PowerGenerationUnitTypes,
    createRecord: async (data: any) => await prisma.powerGenerationUnitType.create({ data }),
  },
  {
    name: 'powerGenerationUnit',
    records: PowerGenerationUnits,
    createRecord: async (data: any) => await prisma.powerGenerationUnit.create({ data }),
  },
  {
    name: 'electrolysisType',
    records: ElectrolysisTypes,
    createRecord: async (data: any) => await prisma.electrolysisType.create({ data }),
  },
  {
    name: 'hydrogenGenerationUnit',
    records: HydrogenGenerationUnits,
    createRecord: async (data: any) => await prisma.hydrogenGenerationUnit.create({ data }),
  },
  {
    name: 'hydrogenStorageUnit',
    records: HydrogenStorageUnits,
    createRecord: async (data: any) => await prisma.hydrogenStorageUnit.create({ data }),
  },
  {
    name: 'batch',
    records: Batches,
    createRecord: async (data: any) => await prisma.batch.create({ data }),
  },
  {
    name: 'process',
    records: Processes,
    createRecord: async (data: any) => await prisma.process.create({ data }),
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
