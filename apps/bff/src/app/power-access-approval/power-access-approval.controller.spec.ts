import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/amqp';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';

describe('PowerAccessApprovalController', () => {
  let controller: PowerAccessApprovalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerAccessApprovalController],
      providers: [
        PowerAccessApprovalService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PowerAccessApprovalController>(PowerAccessApprovalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
