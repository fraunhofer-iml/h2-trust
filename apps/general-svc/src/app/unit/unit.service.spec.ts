import { Test, TestingModule } from '@nestjs/testing';
import { UnitType, unitUnionResultFields } from '@h2-trust/api';
import { PowerProductionUnits, PrismaService, Units } from '@h2-trust/database';
import { UnitService } from './unit.service';

// TODO-MP: see integration tests in skala
describe('UnitService', () => {
  let service: UnitService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      powerProductionUnit: PowerProductionUnits[0],
    };
    const expectedUnit = {
      ...Units[0],
      ...PowerProductionUnits[0],
      ratedPower: PowerProductionUnits[0].ratedPower.toNumber(),
    };
    const unitId = givenUnit.id;

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(givenUnit);

    const response = await service.readUnit(unitId);

    expect(response).toEqual(expectedUnit);
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({
      where: {
        id: unitId,
      },
      ...unitUnionResultFields,
    });
  });

  it('should get units', async () => {
    const givenUnit = {
      ...Units[0],
      powerProductionUnit: PowerProductionUnits[0],
    };
    const expectedUnit = {
      id: givenUnit.id,
      name: givenUnit.name,
      ratedPower: givenUnit.powerProductionUnit.ratedPower.toNumber(),
      energyTypeName: givenUnit.powerProductionUnit.typeName,
      producing: true,
    };

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([givenUnit]);

    const response = await service.readUnits(givenUnit.companyId, UnitType.powerProductionUnit);

    expect(response).toEqual([expectedUnit]);
  });
});
