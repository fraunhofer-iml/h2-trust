import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, PowerProductionUnitEntity } from '@h2-trust/amqp';
import {
  Addresses,
  allUnitsResultFields,
  Batches,
  Companies,
  DatabaseModule,
  hydrogenProductionUnitResultFields,
  HydrogenProductionUnits,
  hydrogenStorageUnitResultFields,
  HydrogenStorageUnits,
  PowerAccessApprovals,
  powerProductionUnitResultFields,
  PowerProductionUnits,
  PrismaService,
  Units,
} from '@h2-trust/database';
import { UnitService } from './unit.service';

// TODO-MP: see integration tests in skala
describe('UnitService', () => {
  let service: UnitService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        UnitService,
        {
          provide: PrismaService,
          useValue: {
            unit: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            hydrogenProductionUnit: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            hydrogenStorageUnit: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get unit by ID', async () => {
    const givenUnit = {
      ...Units[0],
      address: Addresses[0],
      company: {
        ...Companies[0],
        hydrogenApprovals: PowerAccessApprovals,
      },
      powerProductionUnit: PowerProductionUnits[0],
    };
    const unitId = givenUnit.id;

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(givenUnit);

    const response = await service.readUnit(unitId);

    expect(response).toEqual(PowerProductionUnitEntity.fromDatabase(givenUnit));
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({
      where: {
        id: unitId,
      },
      ...allUnitsResultFields,
    });
  });

  it('should get power production units', async () => {
    const givenUnit = {
      ...Units[0],
      address: Addresses[0],
      company: {
        ...Companies[0],
        hydrogenApprovals: PowerAccessApprovals,
      },
      powerProductionUnit: PowerProductionUnits[0],
    };
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readPowerProductionUnits(companyId);

    expect(response).toEqual([PowerProductionUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: companyId,
        powerProductionUnit: {
          isNot: null,
        },
      },
      ...powerProductionUnitResultFields,
    });
  });

  it('should get hydrogen production units', async () => {
    const givenUnit = {
      ...Units[0],
      address: Addresses[0],
      company: {
        ...Companies[0],
        hydrogenApprovals: PowerAccessApprovals,
      },
      hydrogenProductionUnit: {
        ...HydrogenProductionUnits[0],
        hydrogenStorageUnit: {
          ...HydrogenStorageUnits[0],
          generalInfo: Units[2],
        },
      },
    };
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readHydrogenProductionUnits(companyId);

    expect(response).toEqual([HydrogenProductionUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: companyId,
        hydrogenProductionUnit: {
          isNot: null,
        },
      },
      ...hydrogenProductionUnitResultFields,
    });
  });

  it('should get hydrogen storage units', async () => {
    const givenUnit = {
      ...Units[0],
      address: Addresses[0],
      company: {
        ...Companies[0],
        hydrogenApprovals: PowerAccessApprovals,
      },
      hydrogenStorageUnit: {
        ...HydrogenStorageUnits[0],
        filling: [Batches[1]],
        hydrogenProductionUnits: [
          {
            ...HydrogenProductionUnits[0],
            generalInfo: Units[1],
          },
        ],
      },
    };
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readHydrogenStorageUnits(companyId);

    expect(response).toEqual([HydrogenStorageUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: companyId,
        hydrogenStorageUnit: {
          isNot: null,
        },
      },
      ...hydrogenStorageUnitResultFields,
    });
  });
});
