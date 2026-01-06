/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  CreateProductionEntity,
  CreateProductionsPayload,
  ParsedFileBundles,
  PowerAccessApprovalEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { StagedProductionRepository } from '@h2-trust/database';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { AccountingPeriodMatchingService } from './accounting-period-matching.service';
import { ProductionCreationService } from './production-creation.service';
import { ProductionImportService } from './production-import.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  const DERIVED_HYDROGEN_COLOR = HydrogenColor.GREEN;
  const DERIVED_COMPANY_ID = 'company-id';

  let controller: ProductionController;
  let generalSvcSendMock: jest.Mock;
  let batchSvcSendMock: jest.Mock;
  let stagedProductionRepository: StagedProductionRepository;

  beforeEach(async () => {
    generalSvcSendMock = jest.fn().mockImplementation(() => {
      return of({
        waterConsumptionLitersPerHour: 10,
        type: {
          hydrogenColor: DERIVED_HYDROGEN_COLOR,
        },
        company: {
          id: DERIVED_COMPANY_ID,
        },
      });
    });

    batchSvcSendMock = jest.fn().mockImplementation((_pattern, data) => {
      return of(data.processSteps);
    });

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        ProductionCreationService,
        ProductionImportService,
        ProductionService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: generalSvcSendMock,
          },
        },
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: batchSvcSendMock,
          },
        },
        AccountingPeriodMatchingService,
        {
          provide: StagedProductionRepository,
          useValue: {
            stageProductions: jest.fn(),
            stageParsedProductions: jest.fn(),
            getStagedProductionById: jest.fn(),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            getProcessSvcConfiguration: jest.fn().mockReturnValue({
              productionChunkSize: 50,
            }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<ProductionController>(ProductionController);
    stagedProductionRepository = moduleRef.get<StagedProductionRepository>(StagedProductionRepository);
  });

  it('should create production process steps and call batchService.send for each period', async () => {
    const givenPayload = CreateProductionsPayload.of(
      new Date('2025-01-01T10:00:00Z'),
      new Date('2025-01-01T11:00:00Z'),
      'unit-power-1',
      90,
      'unit-hydrogen-1',
      60,
      'user-id-1',
      'hydrogen-storage-unit-1',
    );

    const actualResponse = await controller.createProductions(givenPayload);

    expect(batchSvcSendMock.mock.calls.length).toBe(2); // One for power & water, one for hydrogen
    expect(actualResponse.length).toBe(3);

    const powerProductions = actualResponse.filter(
      (powerProduction) => powerProduction.type === ProcessType.POWER_PRODUCTION,
    );
    expect(powerProductions.length).toBe(1);

    const waterConsumptions = actualResponse.filter(
      (waterConsumption) => waterConsumption.type === ProcessType.WATER_CONSUMPTION,
    );
    expect(waterConsumptions.length).toBe(1);

    const hydrogenProductions = actualResponse.filter(
      (hydrogenProduction) => hydrogenProduction.type === ProcessType.HYDROGEN_PRODUCTION,
    );
    expect(hydrogenProductions.length).toBe(1);

    expect(actualResponse.length).toBe(powerProductions.length + waterConsumptions.length + hydrogenProductions.length);

    const expectedPowerAmount = givenPayload.powerAmountKwh / powerProductions.length;
    const expectedWaterAmount = 10;
    const expectedHydrogenAmount = givenPayload.hydrogenAmountKg / hydrogenProductions.length;

    actualResponse
      .filter((powerProduction) => powerProduction.type === ProcessType.POWER_PRODUCTION)
      .forEach((powerProduction) => {
        expect(powerProduction.startedAt).toStrictEqual(new Date(givenPayload.productionStartedAt));
        expect(powerProduction.endedAt).toStrictEqual(
          new Date(new Date(givenPayload.productionEndedAt).setSeconds(-1)),
        );
        expect(powerProduction.type).toBe(ProcessType.POWER_PRODUCTION);
        expect(powerProduction.batch.amount).toBe(expectedPowerAmount);
        expect(powerProduction.batch.qualityDetails).toBeNull();
        expect(powerProduction.batch.type).toBe(BatchType.POWER);
        expect(powerProduction.batch.owner.id).toBe(DERIVED_COMPANY_ID);
        expect(powerProduction.batch.hydrogenStorageUnit).toBeNull();
        expect(powerProduction.recordedBy.id).toBe(givenPayload.userId);
        expect(powerProduction.executedBy.id).toBe(givenPayload.powerProductionUnitId);
      });

    actualResponse
      .filter((waterConsumption) => waterConsumption.type === ProcessType.WATER_CONSUMPTION)
      .forEach((waterConsumption) => {
        expect(waterConsumption.startedAt).toStrictEqual(new Date(givenPayload.productionStartedAt));
        expect(waterConsumption.endedAt).toStrictEqual(
          new Date(new Date(givenPayload.productionEndedAt).setSeconds(-1)),
        );
        expect(waterConsumption.type).toBe(ProcessType.WATER_CONSUMPTION);
        expect(waterConsumption.batch.amount).toBe(expectedWaterAmount);
        expect(waterConsumption.batch.qualityDetails).toBeNull();
        expect(waterConsumption.batch.type).toBe(BatchType.WATER);
        expect(waterConsumption.batch.owner.id).toBe(DERIVED_COMPANY_ID);
        expect(waterConsumption.batch.hydrogenStorageUnit).toBeNull();
        expect(waterConsumption.recordedBy.id).toBe(givenPayload.userId);
        expect(waterConsumption.executedBy.id).toBe(givenPayload.hydrogenProductionUnitId);
      });

    actualResponse
      .filter((hydrogenProduction) => hydrogenProduction.type === ProcessType.HYDROGEN_PRODUCTION)
      .forEach((hydrogenProduction) => {
        expect(hydrogenProduction.startedAt).toStrictEqual(new Date(givenPayload.productionStartedAt));
        expect(hydrogenProduction.endedAt).toStrictEqual(
          new Date(new Date(givenPayload.productionEndedAt).setSeconds(-1)),
        );
        expect(hydrogenProduction.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
        expect(hydrogenProduction.batch.amount).toBe(expectedHydrogenAmount);
        expect(hydrogenProduction.batch.qualityDetails.color).toBe(DERIVED_HYDROGEN_COLOR);
        expect(hydrogenProduction.batch.type).toBe(BatchType.HYDROGEN);
        expect(hydrogenProduction.batch.owner.id).toBe(DERIVED_COMPANY_ID);
        expect(hydrogenProduction.batch.hydrogenStorageUnit.id).toBe(givenPayload.hydrogenStorageUnitId);
        expect(hydrogenProduction.recordedBy.id).toBe(givenPayload.userId);
        expect(hydrogenProduction.executedBy.id).toBe(givenPayload.hydrogenProductionUnitId);
      });

    actualResponse.forEach((processStep) => {
      expect(processStep.startedAt).toBeInstanceOf(Date);
      expect(processStep.endedAt).toBeInstanceOf(Date);
      expect(processStep.endedAt.getTime()).toBeGreaterThan(processStep.startedAt.getTime());
    });
  });

  it('should create accounting periods from parsed files', async () => {
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

    generalSvcSendMock.mockImplementation(() => {
      return of([
        { id: 'test-approval-1', powerProductionUnit: { type: { name: 'GRID' } } } as PowerAccessApprovalEntity,
      ]);
    });

    jest.spyOn(stagedProductionRepository, 'stageParsedProductions').mockResolvedValue('test-id');

    const actualResponse = await controller.stageProductions({ data, userId: 'user-id-1' });

    expect(actualResponse.numberOfBatches).toBe(2);
    expect(actualResponse.id).toBe('test-id');
  });
});
