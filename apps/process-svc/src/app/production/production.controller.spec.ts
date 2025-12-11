/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, CreateProductionEntity, ParsedFileBundles, PowerAccessApprovalEntity } from '@h2-trust/amqp';
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
          id: 'company-id',
        },
      });
    });

    batchSvcSendMock = jest.fn().mockImplementation((_pattern, data) => {
      return of({
        ...data.processStepEntity,
      });
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
    const givenProduction: CreateProductionEntity = {
      productionStartedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
      productionEndedAt: new Date('2025-01-01T11:00:00Z').toISOString(),
      powerProductionUnitId: 'unit-power-1',
      powerAmountKwh: 90,
      hydrogenProductionUnitId: 'unit-hydrogen-1',
      hydrogenAmountKg: 60,
      recordedBy: 'user-id-1',
      hydrogenColor: DERIVED_HYDROGEN_COLOR,
      hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
      companyIdOfPowerProductionUnit: 'company-power-1',
      companyIdOfHydrogenProductionUnit: 'company-hydrogen-1',
      waterConsumptionLitersPerHour: 10,
    };

    const actualResponse = await controller.createProductions({ createProductionEntity: givenProduction });

    expect(batchSvcSendMock.mock.calls.length).toBe(3);
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

    const expectedPowerAmount = givenProduction.powerAmountKwh / powerProductions.length;
    const expectedWaterAmount = givenProduction.waterConsumptionLitersPerHour;
    const expectedHydrogenAmount = givenProduction.hydrogenAmountKg / hydrogenProductions.length;

    actualResponse
      .filter((powerProduction) => powerProduction.type === ProcessType.POWER_PRODUCTION)
      .forEach((powerProduction) => {
        expect(powerProduction.startedAt).toStrictEqual(new Date(givenProduction.productionStartedAt));
        expect(powerProduction.endedAt).toStrictEqual(
          new Date(new Date(givenProduction.productionEndedAt).setSeconds(-1)),
        );
        expect(powerProduction.type).toBe(ProcessType.POWER_PRODUCTION);
        expect(powerProduction.batch.amount).toBe(expectedPowerAmount);
        expect(powerProduction.batch.qualityDetails).toBeNull();
        expect(powerProduction.batch.type).toBe(BatchType.POWER);
        expect(powerProduction.batch.owner.id).toBe(givenProduction.companyIdOfPowerProductionUnit);
        expect(powerProduction.batch.hydrogenStorageUnit).toBeNull();
        expect(powerProduction.recordedBy.id).toBe(givenProduction.recordedBy);
        expect(powerProduction.executedBy.id).toBe(givenProduction.powerProductionUnitId);
      });

    actualResponse
      .filter((powerProduction) => powerProduction.type === ProcessType.WATER_CONSUMPTION)
      .forEach((powerProduction) => {
        expect(powerProduction.startedAt).toStrictEqual(new Date(givenProduction.productionStartedAt));
        expect(powerProduction.endedAt).toStrictEqual(
          new Date(new Date(givenProduction.productionEndedAt).setSeconds(-1)),
        );
        expect(powerProduction.type).toBe(ProcessType.WATER_CONSUMPTION);
        expect(powerProduction.batch.amount).toBe(expectedWaterAmount);
        expect(powerProduction.batch.qualityDetails).toBeNull();
        expect(powerProduction.batch.type).toBe(BatchType.WATER);
        expect(powerProduction.batch.owner.id).toBe(givenProduction.companyIdOfHydrogenProductionUnit);
        expect(powerProduction.batch.hydrogenStorageUnit).toBeNull();
        expect(powerProduction.recordedBy.id).toBe(givenProduction.recordedBy);
        expect(powerProduction.executedBy.id).toBe(givenProduction.hydrogenProductionUnitId);
      });

    actualResponse
      .filter((powerProduction) => powerProduction.type === ProcessType.HYDROGEN_PRODUCTION)
      .forEach((powerProduction) => {
        expect(powerProduction.startedAt).toStrictEqual(new Date(givenProduction.productionStartedAt));
        expect(powerProduction.endedAt).toStrictEqual(
          new Date(new Date(givenProduction.productionEndedAt).setSeconds(-1)),
        );
        expect(powerProduction.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
        expect(powerProduction.batch.amount).toBe(expectedHydrogenAmount);
        expect(powerProduction.batch.qualityDetails.color).toBe(DERIVED_HYDROGEN_COLOR);
        expect(powerProduction.batch.type).toBe(BatchType.HYDROGEN);
        expect(powerProduction.batch.owner.id).toBe(givenProduction.companyIdOfHydrogenProductionUnit);
        expect(powerProduction.batch.hydrogenStorageUnit.id).toBe(givenProduction.hydrogenStorageUnitId);
        expect(powerProduction.recordedBy.id).toBe(givenProduction.recordedBy);
        expect(powerProduction.executedBy.id).toBe(givenProduction.hydrogenProductionUnitId);
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
