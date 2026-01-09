import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenStorageUnitController } from './hydrogen-storage-unit.controller';

describe('HydrogenStorageUnitController', () => {
  let controller: HydrogenStorageUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HydrogenStorageUnitController],
    }).compile();

    controller = module.get<HydrogenStorageUnitController>(HydrogenStorageUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
