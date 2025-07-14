import { Test, TestingModule } from '@nestjs/testing';
import { BottlingService } from './bottling.service';
import { BrokerQueues } from '@h2-trust/amqp';

describe('BottlingService', () => {
  let service: BottlingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<BottlingService>(BottlingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
