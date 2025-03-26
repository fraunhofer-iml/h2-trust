import { Test, TestingModule } from '@nestjs/testing';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';

describe('ProcessingController', () => {
  let controller: ProcessingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessingController],
      providers: [
        {
          provide: ProcessingService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProcessingController>(ProcessingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
