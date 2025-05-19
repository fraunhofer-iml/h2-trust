import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/amqp';
import { CompanyDto, CompanyDtoMock } from '@h2-trust/api';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        CompanyService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all companies', async () => {
    const expectedReturnValue = CompanyDtoMock;

    const res: CompanyDto[] = await controller.findAll();

    expect(res).toEqual(expectedReturnValue);
  });
});
