import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/amqp';
import { CreateProductionDto, ProcessType } from '@h2-trust/api';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchTypeDbEnum, HydrogenColorDbEnum } from '@h2-trust/database';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  const DERIVED_HYDROGEN_COLOR = HydrogenColorDbEnum.GREEN;

  let controller: ProductionController;
  let batchServiceSendMock: jest.Mock;

  beforeEach(async () => {
    batchServiceSendMock = jest.fn().mockImplementation((_pattern, data) => {
      return of({
        ...data.processStepEntity,
      });
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        ProductionService,
        {
          provide: ConfigurationService,
          useValue: {
            getProcessSvcConfiguration: () => ({
              powerAccountingPeriodInSeconds: 900,
              hydrogenAccountingPeriodInSeconds: 900,
            }),
          },
        },
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: batchServiceSendMock,
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<ProductionController>(ProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create production process steps and call batchService.send for each period', async () => {
    const dto: CreateProductionDto = {
      productionStartedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
      productionEndedAt: new Date('2025-01-01T10:31:00Z').toISOString(),
      powerAmountKwh: 90,
      hydrogenAmountKg: 60,
      powerProductionUnitId: 'unit-power-1',
      hydrogenProductionUnitId: 'unit-hydrogen-1',
    };

    const actualResponse = await controller.createProduction({
      dto: dto,
      hydrogenColor: DERIVED_HYDROGEN_COLOR
    });

    expect(batchServiceSendMock).toHaveBeenCalledTimes(6); // 3 Power + 3 Hydrogen

    expect(Array.isArray(actualResponse)).toBe(true);

    expect(actualResponse.length).toBe(6); // 3 Power + 3 Hydrogen

    actualResponse
      .filter((step) => step.processType === ProcessType.POWER_PRODUCTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('processType', ProcessType.POWER_PRODUCTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 30);
        expect(processStepEntity.batch).toHaveProperty('quality', '{}');
        expect(processStepEntity.batch).toHaveProperty('type', BatchTypeDbEnum.POWER);
        expect(processStepEntity.batch).toHaveProperty('owner', { id: 'company-power-1' });
        expect(processStepEntity).toHaveProperty('recordedBy', { id: 'user-power-1' });
        expect(processStepEntity).toHaveProperty('executedBy', { id: 'unit-power-1' });
      });

    actualResponse
      .filter((step) => step.processType === ProcessType.HYDROGEN_PRODUCTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('processType', ProcessType.HYDROGEN_PRODUCTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 20);
        expect(processStepEntity.batch).toHaveProperty('quality', JSON.stringify({color: DERIVED_HYDROGEN_COLOR,}));
        expect(processStepEntity.batch).toHaveProperty('type', BatchTypeDbEnum.HYDROGEN);
        expect(processStepEntity.batch).toHaveProperty('owner', { id: 'company-hydrogen-1' });
        expect(processStepEntity).toHaveProperty('recordedBy', { id: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4' });
        expect(processStepEntity).toHaveProperty('executedBy', { id: 'unit-hydrogen-1' });
      });

    expect(actualResponse[0]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:00:00.000Z'),
        endedAt: new Date('2025-01-01T10:14:59.000Z'),
      }),
    );

    expect(actualResponse[1]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:15:00.000Z'),
        endedAt: new Date('2025-01-01T10:29:59.000Z'),
      }),
    );

    expect(actualResponse[2]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:30:00.000Z'),
        endedAt: new Date('2025-01-01T10:44:59.000Z'),
      }),
    );

    expect(actualResponse[3]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:00:00.000Z'),
        endedAt: new Date('2025-01-01T10:14:59.000Z'),
      }),
    );

    expect(actualResponse[4]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:15:00.000Z'),
        endedAt: new Date('2025-01-01T10:29:59.000Z'),
      }),
    );

    expect(actualResponse[5]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:30:00.000Z'),
        endedAt: new Date('2025-01-01T10:44:59.000Z'),
      }),
    );
  });
});
