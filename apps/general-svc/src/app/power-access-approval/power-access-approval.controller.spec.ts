import { Test, TestingModule } from '@nestjs/testing';
import { PowerAccessApprovalRepository, UserRepository } from '@h2-trust/database';
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
          provide: PowerAccessApprovalRepository,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: UserRepository,
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
