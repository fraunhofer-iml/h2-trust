import { Test, TestingModule } from '@nestjs/testing';
import { processStepResultFields } from '@h2-trust/api';
import { Batches, Companies, PrismaService, ProcessSteps, Units } from '@h2-trust/database';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    const expectedProcessStep = {
      id: givenProcessStep.id,
      timestamp: givenProcessStep.timestamp,
      owner: givenProcessStep.batch.owner.name,
      filledAmount: givenProcessStep.batch.quantity.toNumber(),
      color: givenProcessStep.batch.quality,
    };

    jest.spyOn(prisma.processStep, 'findMany').mockResolvedValue([givenProcessStep]);

    const response = await service.readProcessSteps(
      givenProcessStep.processName,
      givenProcessStep.batch.active,
      givenProcessStep.executedBy.companyId,
    );
    expect(response).toEqual([expectedProcessStep]);
    expect(prisma.processStep.findMany).toHaveBeenCalledWith({
      where: {
        processName: givenProcessStep.processName,
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
