import { Test, TestingModule } from '@nestjs/testing';
import { ProductionIntervallCleanupService } from './production-intervall-cleanup.service';

describe('ProductionIntervallCleanupService', () => {
  let service: ProductionIntervallCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionIntervallCleanupService],
    }).compile();

    service = module.get<ProductionIntervallCleanupService>(ProductionIntervallCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
