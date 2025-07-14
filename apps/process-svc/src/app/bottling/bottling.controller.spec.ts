import { Test, TestingModule } from '@nestjs/testing';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';
import { BrokerQueues } from '@h2-trust/amqp';

describe('BottlingController', () => {
  let controller: BottlingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BottlingController],
      providers: [
        BottlingService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
