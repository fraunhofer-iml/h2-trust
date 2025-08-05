 import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { DatabaseModule, PrismaService } from "libs/database/src/lib";
 import { CompanyType } from '@prisma/client';
 import { CompanyEntity } from '@h2-trust/amqp';


describe('CompanyController', () => {
  let controller: CompanyController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [CompanyController],
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findMany: jest.fn(),
            }
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    prisma = module.get<PrismaService>(PrismaService);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get companies ', async () => {
    const expectedResponse = [
      {
        id: 'company-power-1',
        name: 'PowerGen AG',
        mastrNumber: 'P12345',
        companyType: CompanyType.POWER_PRODUCER,
        addressId: 'address-power-1',
        address: {
          id: 'address-power-1',
          street: 'Energieweg 1',
          postalCode: '12345',
          city: 'Energietown',
          state: 'Energieland',
          country: 'Energieland'
        }
      }
    ];

    jest.spyOn(prisma.company, 'findMany').mockResolvedValue(expectedResponse);
    const actualResponse = await controller.findAll();
    expect(actualResponse).toEqual(expectedResponse.map(CompanyEntity.fromDatabase));
    expect(prisma.company.findMany).toHaveBeenCalled();
  });
});
