import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, PowerProductionUnitEntity } from '@h2-trust/amqp';
import {
  DatabaseModule,
  HydrogenProductionUnitDbTypeMock,
  HydrogenStorageUnitDbTypeMock,
  PowerProductionUnitDbTypeMock,
  PrismaService,
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
    const givenUnit = PowerProductionUnitDbTypeMock[0];
    const unitId = givenUnit.id;

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(givenUnit);

    const response = await service.readUnit(unitId);

    expect(response).toEqual(PowerProductionUnitEntity.fromDatabase(givenUnit));
    expect(prisma.unit.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: unitId,
        },
      }),
    );
  });

  it('should get power production units', async () => {
    const givenUnit = PowerProductionUnitDbTypeMock[0];
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readPowerProductionUnits(companyId);

    expect(response).toEqual([PowerProductionUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: companyId,
          powerProductionUnit: {
            isNot: null,
          },
        },
      }),
    );
  });

  it('should get hydrogen production units', async () => {
    const givenUnit = HydrogenProductionUnitDbTypeMock[0];
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readHydrogenProductionUnits(companyId);

    expect(response).toEqual([HydrogenProductionUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: companyId,
          hydrogenProductionUnit: {
            isNot: null,
          },
        },
      }),
    );
  });

  it('should get hydrogen storage units', async () => {
    const givenUnit = HydrogenStorageUnitDbTypeMock[0];
    const companyId = givenUnit.companyId;

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readHydrogenStorageUnits(companyId);

    expect(response).toEqual([HydrogenStorageUnitEntity.fromDatabase(givenUnit)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: companyId,
          hydrogenStorageUnit: {
            isNot: null,
          },
        },
      }),
    );
  });
});
