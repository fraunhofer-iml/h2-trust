import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenProductionUnitController } from './hydrogen-production-unit.controller';

describe('HydrogenProductionUnitController', () => {
  let controller: HydrogenProductionUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HydrogenProductionUnitController],
    }).compile();

    controller = module.get<HydrogenProductionUnitController>(HydrogenProductionUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
