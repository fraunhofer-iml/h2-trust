import { PrismaClient } from '@prisma/client';
import {
  AddressSeed,
  BatchRelationHydrogenHydrogenSeed,
  BatchRelationPowerHydrogenSeed,
  BatchSeed,
  BiddingZoneSeed,
  CompanySeed,
  DocumentSeed,
  FuelTypeSeed,
  GridLevelSeed,
  HydrogenProductionTypeSeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageTypeSeed,
  HydrogenStorageUnitSeed,
  PowerAccessApprovalSeed,
  PowerProductionTypeSeed,
  PowerProductionUnitSeed,
  ProcessStepSeed,
  ProcessTypeSeed,
  TransportModeSeed,
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
      name: 'hydrogenProductionType',
      records: HydrogenProductionTypeSeed,
      createRecord: async (data: any) => await prisma.hydrogenProductionType.create({ data }),
    },
    {
      name: 'hydrogenStorageType',
      records: HydrogenStorageTypeSeed,
      createRecord: async (data: any) => await prisma.hydrogenStorageType.create({ data }),
    },
    {
      name: 'gridLevel',
      records: GridLevelSeed,
      createRecord: async (data: any) => await prisma.gridLevel.create({ data }),
    },
    {
      name: 'biddingZone',
      records: BiddingZoneSeed,
      createRecord: async (data: any) => await prisma.biddingZone.create({ data }),
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
      name: 'batchRelationHydrogenHydrogen',
      records: BatchRelationHydrogenHydrogenSeed,
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
      records: ProcessTypeSeed,
      createRecord: async (data: any) => await prisma.processType.create({ data }),
    },
    {
      name: 'processStep',
      records: ProcessStepSeed,
      createRecord: async (data: any) => await prisma.processStep.create({ data }),
    },
    {
      name: 'transportMode',
      records: TransportModeSeed,
      createRecord: async (data: any) => await prisma.transportMode.create({ data }),
    },
    {
      name: 'fuelType',
      records: FuelTypeSeed,
      createRecord: async (data: any) => await prisma.fuelType.create({ data }),
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
