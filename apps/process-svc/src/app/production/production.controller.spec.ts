/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionIntervallRepository } from 'libs/database/src/lib/repositories/production-intervall.repository';
import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  CreateProductionEntity,
  ParsedFileBundles,
  PowerAccessApprovalEntity,
  ProductionIntervallEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { AccountingPeriodMatcherService } from './accounting-period-matching/accounting-period-matcher.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  const DERIVED_HYDROGEN_COLOR = HydrogenColor.GREEN;

  let controller: ProductionController;
  let generalServiceSendMock: jest.Mock;
  let batchServiceSendMock: jest.Mock;
  let productionIntervallRepo: ProductionIntervallRepository;

  beforeEach(async () => {
    generalServiceSendMock = jest.fn().mockImplementation(() => {
      return of({
        waterConsumptionLitersPerHour: 18,
      });
    });
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
              waterAccountingPeriodInSeconds: 900,
              hydrogenAccountingPeriodInSeconds: 900,
            }),
          },
        },
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: generalServiceSendMock,
          },
        },
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: batchServiceSendMock,
          },
        },
        AccountingPeriodMatcherService,
        {
          provide: ProductionIntervallRepository,
          useValue: {
            createProductionIntervalls: jest.fn(),
            getIntervallSetById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<ProductionController>(ProductionController);
    productionIntervallRepo = moduleRef.get<ProductionIntervallRepository>(ProductionIntervallRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create production process steps and call batchService.send for each period', async () => {
    const createProductionEntity: CreateProductionEntity = {
      productionStartedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
      productionEndedAt: new Date('2025-01-01T10:31:00Z').toISOString(),
      powerProductionUnitId: 'unit-power-1',
      powerAmountKwh: 90,
      hydrogenProductionUnitId: 'unit-hydrogen-1',
      hydrogenAmountKg: 60,
      recordedBy: 'user-id-1',
      hydrogenColor: DERIVED_HYDROGEN_COLOR,
      hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
      companyIdOfPowerProductionUnit: 'company-power-1',
      companyIdOfHydrogenProductionUnit: 'company-hydrogen-1',
    };

    const actualResponse = await controller.createProduction({ createProductionEntity });

    expect(batchServiceSendMock).toHaveBeenCalledTimes(9); // 3 Power + 3 Water + 3 Hydrogen
    expect(Array.isArray(actualResponse)).toBe(true);
    expect(actualResponse.length).toBe(9); // 3 Power + 3 Water + 3 Hydrogen

    actualResponse
      .filter((step) => step.type === ProcessType.POWER_PRODUCTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('type', ProcessType.POWER_PRODUCTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 30);
        expect(processStepEntity.batch).toHaveProperty('qualityDetails', null);
        expect(processStepEntity.batch).toHaveProperty('type', BatchType.POWER);
        expect(processStepEntity.batch).toHaveProperty('owner', {
          id: createProductionEntity.companyIdOfPowerProductionUnit,
        });
        expect(processStepEntity.batch).toHaveProperty('hydrogenStorageUnit', {
          id: null,
        });
        expect(processStepEntity).toHaveProperty('recordedBy', {
          id: createProductionEntity.recordedBy,
        });
        expect(processStepEntity).toHaveProperty('executedBy', {
          id: createProductionEntity.powerProductionUnitId,
        });
      });

    actualResponse
      .filter((step) => step.type === ProcessType.WATER_CONSUMPTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('type', ProcessType.WATER_CONSUMPTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 3.1);
        expect(processStepEntity.batch).toHaveProperty('qualityDetails', null);
        expect(processStepEntity.batch).toHaveProperty('type', BatchType.WATER);
        expect(processStepEntity.batch).toHaveProperty('owner', {
          id: createProductionEntity.companyIdOfHydrogenProductionUnit,
        });
        expect(processStepEntity.batch).toHaveProperty('hydrogenStorageUnit', {
          id: null,
        });
        expect(processStepEntity).toHaveProperty('recordedBy', {
          id: createProductionEntity.recordedBy,
        });
        expect(processStepEntity).toHaveProperty('executedBy', {
          id: createProductionEntity.hydrogenProductionUnitId,
        });
      });

    actualResponse
      .filter((step) => step.type === ProcessType.HYDROGEN_PRODUCTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('type', ProcessType.HYDROGEN_PRODUCTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 20);
        expect(processStepEntity.batch).toHaveProperty('qualityDetails', { color: DERIVED_HYDROGEN_COLOR, id: null });
        expect(processStepEntity.batch).toHaveProperty('type', BatchType.HYDROGEN);
        expect(processStepEntity.batch).toHaveProperty('owner', {
          id: createProductionEntity.companyIdOfHydrogenProductionUnit,
        });
        expect(processStepEntity.batch).toHaveProperty('hydrogenStorageUnit', {
          id: createProductionEntity.hydrogenStorageUnitId,
        });
        expect(processStepEntity).toHaveProperty('recordedBy', {
          id: createProductionEntity.recordedBy,
        });
        expect(processStepEntity).toHaveProperty('executedBy', {
          id: createProductionEntity.hydrogenProductionUnitId,
        });
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
    expect(actualResponse[6]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:00:00.000Z'),
        endedAt: new Date('2025-01-01T10:14:59.000Z'),
      }),
    );

    expect(actualResponse[7]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:15:00.000Z'),
        endedAt: new Date('2025-01-01T10:29:59.000Z'),
      }),
    );

    expect(actualResponse[8]).toEqual(
      expect.objectContaining({
        startedAt: new Date('2025-01-01T10:30:00.000Z'),
        endedAt: new Date('2025-01-01T10:44:59.000Z'),
      }),
    );
  });

  it('should create productionintervalls from parsed files', async () => {
    const data: ParsedFileBundles = {
      hydrogenProduction: [
        {
          unitId: 'test-hydrogen-unit-1',
          data: [
            {
              amount: 20,
              power: 40,
              time: new Date('2025-01-01T10:44:59.000Z'),
            },
          ],
        },
      ],
      powerProduction: [
        {
          unitId: 'test-hydrogen-unit-1',
          data: [
            {
              amount: 20,
              time: new Date('2025-01-01T10:44:59.000Z'),
            },
          ],
        },
      ],
    };

    generalServiceSendMock.mockImplementation(() => {
      return of([
        { id: 'test-approval-1', powerProductionUnit: { type: { name: 'GRID' } } } as PowerAccessApprovalEntity,
      ]);
    });

    jest
      .spyOn(productionIntervallRepo, 'createProductionIntervalls')
      .mockResolvedValue({ id: 'test-id', createdAt: new Date() });

    const actualResponse = await controller.createProductionIntervalsFromCsvData({ data, userId: 'user-id-1' });

    expect(actualResponse.numberOfBatches).toBe(2);
    expect(actualResponse.id).toBe('test-id');
  });
});
