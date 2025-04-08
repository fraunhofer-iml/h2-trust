import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity } from '@h2-trust/amqp';
import {
  Batches,
  Companies,
  DatabaseModule,
  PrismaService,
  processStepResultFields,
  ProcessSteps,
  Units,
} from '@h2-trust/database';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
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
    const givenProcessStep = {
      ...ProcessSteps[1],
      batch: {
        ...Batches[1],
        owner: Companies[1],
      },
      executedBy: Units[1],
    };

    jest.spyOn(prisma.processStep, 'findMany').mockResolvedValue([givenProcessStep]);

    const response = await service.readProcessSteps(
      givenProcessStep.processTypeName,
      givenProcessStep.batch.active,
      givenProcessStep.executedBy.companyId,
    );
    expect(response).toEqual([ProcessStepEntity.fromDatabase(givenProcessStep)]);
    expect(prisma.processStep.findMany).toHaveBeenCalledWith({
      where: {
        processTypeName: givenProcessStep.processTypeName,
        batch: {
          active: givenProcessStep.batch.active,
        },
        executedBy: {
          companyId: givenProcessStep.executedBy.companyId,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      ...processStepResultFields,
    });
  });
});
