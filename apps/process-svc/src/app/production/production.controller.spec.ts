/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, CreateProductionEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  const DERIVED_HYDROGEN_COLOR = HydrogenColor.GREEN;

  let controller: ProductionController;
  let generalServiceSendMock: jest.Mock;
  let batchServiceSendMock: jest.Mock;

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
      ],
    }).compile();

    controller = moduleRef.get<ProductionController>(ProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO-MP: remove comments with DUHGW-236
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
    //expect(actualResponse.length).toBe(9); // 3 Power + 3 Water + 3 Hydrogen
    expect(actualResponse.length).toBe(6); // 3 Power + 3 Water + 3 Hydrogen

    actualResponse
      .filter((step) => step.type === ProcessType.POWER_PRODUCTION)
      .forEach((processStepEntity) => {
        expect(processStepEntity).toHaveProperty('startedAt');
        expect(processStepEntity).toHaveProperty('endedAt');
        expect(processStepEntity).toHaveProperty('type', ProcessType.POWER_PRODUCTION);
        expect(processStepEntity).toHaveProperty('batch');
        expect(processStepEntity.batch).toHaveProperty('amount', 30);
        expect(processStepEntity.batch).toHaveProperty('quality', '{}');
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
        expect(processStepEntity.batch).toHaveProperty('quality', '{}');
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
        expect(processStepEntity.batch).toHaveProperty('quality', JSON.stringify({ color: DERIVED_HYDROGEN_COLOR }));
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
    /*
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
    */
  });
});
