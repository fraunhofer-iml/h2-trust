import { Test, TestingModule } from '@nestjs/testing';
import { PowerProductionUnitController } from './power-production-unit.controller';

describe('PowerProductionUnitController', () => {
  let controller: PowerProductionUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerProductionUnitController],
    }).compile();

    controller = module.get<PowerProductionUnitController>(PowerProductionUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
