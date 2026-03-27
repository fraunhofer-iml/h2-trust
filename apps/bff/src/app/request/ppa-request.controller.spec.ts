import { Test, TestingModule } from '@nestjs/testing';
import { PpaRequestController } from './ppa-request.controller';

describe('PpaRequestController', () => {
  let controller: PpaRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PpaRequestController],
    }).compile();

    controller = module.get<PpaRequestController>(PpaRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
