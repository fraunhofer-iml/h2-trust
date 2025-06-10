import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, PowerProductionUnitEntity } from '@h2-trust/amqp';
import {
  allUnitsResultFields,
  DatabaseModule,
  HydrogenProductionUnitDbTypeMock,
  hydrogenProductionUnitResultFields,
  HydrogenStorageUnitDbTypeMock,
  hydrogenStorageUnitResultFields,
  PowerProductionUnitDbTypeMock,
  powerProductionUnitResultFields,
  PrismaService,
} from '@h2-trust/database';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UnitController],
      providers: [
        UnitService,
        {
          provide: PrismaService,
          useValue: {
            unit: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UnitController>(UnitController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get unit by id', async () => {
    const expectedResponse = PowerProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readUnit({ id: expectedResponse.id });

    expect(actualResponse).toEqual(PowerProductionUnitEntity.fromDatabase(expectedResponse));
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({
      where: {
        id: expectedResponse.id,
      },
      ...allUnitsResultFields,
    });
  });

  it('should get power production units', async () => {
    const expectedResponse = PowerProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readPowerProductionUnits({ companyId: expectedResponse.companyId });

    expect(actualResponse).toEqual([PowerProductionUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: expectedResponse.companyId,
        powerProductionUnit: {
          isNot: null,
        },
      },
      ...powerProductionUnitResultFields,
    });
  });

  it('should get hydrogen production units', async () => {
    const expectedResponse = HydrogenProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenProductionUnits({ companyId: expectedResponse.companyId });

    expect(actualResponse).toEqual([HydrogenProductionUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: expectedResponse.companyId,
        hydrogenProductionUnit: {
          isNot: null,
        },
      },
      ...hydrogenProductionUnitResultFields,
    });
  });

  it('should get hydrogen storage units', async () => {
    const expectedResponse = HydrogenStorageUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenStorageUnits({ companyId: expectedResponse.companyId });

    expect(actualResponse).toEqual([HydrogenStorageUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        companyId: expectedResponse.companyId,
        hydrogenStorageUnit: {
          isNot: null,
        },
      },
      ...hydrogenStorageUnitResultFields,
    });
  });
});
