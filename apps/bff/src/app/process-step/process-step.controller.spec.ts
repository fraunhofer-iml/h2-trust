import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/amqp';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import 'multer';

describe('ProcessStepController', () => {
  let controller: ProcessStepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessStepController],
      providers: [
        ProcessStepService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessStepController>(ProcessStepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
