import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { DatabaseModule, PrismaService, ProcessStepDbTypeMock } from '@h2-trust/database';
import { ProcessStepService } from './process-step.service';
import { ConfigurationModule } from '@h2-trust/configuration';

describe('ProcessStepService', () => {
  let service: ProcessStepService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule, DatabaseModule],
      providers: [
        ProcessStepService,
        {
          provide: PrismaService,
          useValue: {
            processStep: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProcessStepService>(ProcessStepService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should get processSteps', async () => {
    const givenProcessStep = ProcessStepDbTypeMock[0];

    jest.spyOn(prisma.processStep, 'findMany').mockResolvedValue([givenProcessStep]);

    const response = await service.readProcessSteps(
      givenProcessStep.processTypeName,
      givenProcessStep.batch.active,
      givenProcessStep.executedBy.owner.id,
    );
    expect(response).toEqual([ProcessStepEntity.fromDatabase(givenProcessStep)]);
  });
});
