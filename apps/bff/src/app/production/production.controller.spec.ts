import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/amqp';
import { ProductionOverviewDto, PRODUCTIONOVERVIEWMOCK } from '@h2-trust/api';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  let controller: ProductionController;
  let queue: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        ProductionService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    queue = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all production data', async () => {
    const expectedReturnValue = PRODUCTIONOVERVIEWMOCK;

    const res: ProductionOverviewDto[] = await controller.getProductionDataForCompany('test');

    expect(res).toEqual(expectedReturnValue);
  });
});
