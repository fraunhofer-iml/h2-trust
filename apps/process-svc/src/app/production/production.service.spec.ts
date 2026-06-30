/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { BatchDetailsEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  CompanyEntityFixture,
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenProductionStatisticsPayloadFixture,
  CreateProductionsPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import { PowerProductionType, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { QUEUE_GENERAL_SVC } from '@h2-trust/messaging';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionCreationService } from './production-creation.service';
import { ProductionService } from './production.service';

describe('ProductionService', () => {
  let service: ProductionService;

  const generalSvcMock = {
    send: jest.fn(),
  };

  const productionCreationServiceMock = {
    createAndPersistProductions: jest.fn(),
  };

  const processStepServiceMock = {
    readProcessStepsByPredecessorTypesAndUnitAndDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: ProductionCreationService,
          useValue: productionCreationServiceMock,
        },
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProductions', () => {
    it('should load units and delegate the assembled production entities when called', async () => {
      // arrange
      const givenPayload = CreateProductionsPayloadFixture.create();
      const givenPowerProductionUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.powerProductionUnitId,
        owner: CompanyEntityFixture.createPowerProducer({ id: 'power-owner-1' }),
        details: {
          type: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
        },
      });
      const givenHydrogenProductionUnit = HydrogenProductionUnitEntityFixture.create({
        id: givenPayload.hydrogenProductionUnitId,
        owner: CompanyEntityFixture.createHydrogenProducer({ id: 'hydrogen-owner-1' }),
        details: {
          waterConsumptionLitersPerHour: 25,
        },
      });
      const givenHydrogenStorageUnit = HydrogenStorageUnitEntityFixture.create({
        id: givenPayload.hydrogenStorageUnitId,
      });
      const expectedProcessSteps = [ProcessStepEntityFixture.createHydrogenProduction()];

      generalSvcMock.send
        .mockReturnValueOnce(of(givenPowerProductionUnit))
        .mockReturnValueOnce(of(givenHydrogenProductionUnit))
        .mockReturnValueOnce(of([givenPowerProductionUnit, givenHydrogenProductionUnit, givenHydrogenStorageUnit]));
      productionCreationServiceMock.createAndPersistProductions.mockResolvedValue(expectedProcessSteps);

      // act
      const actualResult = await service.createProductions(givenPayload);

      // assert
      expect(generalSvcMock.send).toHaveBeenCalledTimes(3);
      expect(productionCreationServiceMock.createAndPersistProductions).toHaveBeenCalledTimes(1);

      const [actualCreateProductions, actualProductionUnitsForId] =
        productionCreationServiceMock.createAndPersistProductions.mock.calls[0];

      expect(actualCreateProductions).toHaveLength(1);
      expect(actualCreateProductions[0]).toEqual(
        expect.objectContaining({
          productionStartedAt: givenPayload.productionStartedAt,
          productionEndedAt: givenPayload.productionEndedAt,
          powerProductionUnitId: givenPayload.powerProductionUnitId,
          powerType: PowerType.RENEWABLE,
          powerAmountKwh: givenPayload.powerAmountKwh,
          hydrogenProductionUnitId: givenPayload.hydrogenProductionUnitId,
          hydrogenAmountKg: givenPayload.hydrogenAmountKg,
          recordedBy: givenPayload.userId,
          ownerIdOfPowerProductionUnit: 'power-owner-1',
          ownerIdOfHydrogenProductionUnit: 'hydrogen-owner-1',
          waterConsumptionLitersPerHour: 25,
        }),
      );
      expect(actualProductionUnitsForId.get(givenPayload.powerProductionUnitId)).toEqual(givenPowerProductionUnit);
      expect(actualProductionUnitsForId.get(givenPayload.hydrogenProductionUnitId)).toEqual(
        givenHydrogenProductionUnit,
      );
      expect(actualProductionUnitsForId.get(givenPayload.hydrogenStorageUnitId)).toEqual(givenHydrogenStorageUnit);
      expect(actualResult).toEqual(expectedProcessSteps);
    });

    it('should delegate two split grid productions with preserved shared metadata when called', async () => {
      // arrange
      const givenPayload = CreateProductionsPayloadFixture.create({
        powerAmountKwh: 100,
        hydrogenAmountKg: 10,
      });
      const givenPowerProductionUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.powerProductionUnitId,
        owner: CompanyEntityFixture.createPowerProducer({ id: 'power-owner-1' }),
        details: {
          type: PowerProductionType.GRID,
        },
      });
      const givenHydrogenProductionUnit = HydrogenProductionUnitEntityFixture.create({
        id: givenPayload.hydrogenProductionUnitId,
        owner: CompanyEntityFixture.createHydrogenProducer({ id: 'hydrogen-owner-1' }),
        details: {
          waterConsumptionLitersPerHour: 25,
        },
      });
      const givenHydrogenStorageUnit = HydrogenStorageUnitEntityFixture.create({
        id: givenPayload.hydrogenStorageUnitId,
      });

      generalSvcMock.send
        .mockReturnValueOnce(of(givenPowerProductionUnit))
        .mockReturnValueOnce(of(givenHydrogenProductionUnit))
        .mockReturnValueOnce(of([givenPowerProductionUnit, givenHydrogenProductionUnit, givenHydrogenStorageUnit]));
      productionCreationServiceMock.createAndPersistProductions.mockResolvedValue([]);

      // act
      await service.createProductions(givenPayload);

      // assert
      const [actualCreateProductions] = productionCreationServiceMock.createAndPersistProductions.mock.calls[0];

      expect(actualCreateProductions).toHaveLength(2);
      expect(actualCreateProductions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            powerProductionUnitId: givenPayload.powerProductionUnitId,
            hydrogenProductionUnitId: givenPayload.hydrogenProductionUnitId,
            powerType: PowerType.PARTLY_RENEWABLE,
          }),
          expect.objectContaining({
            powerProductionUnitId: givenPayload.powerProductionUnitId,
            hydrogenProductionUnitId: givenPayload.hydrogenProductionUnitId,
            powerType: PowerType.NON_RENEWABLE,
          }),
        ]),
      );
    });
  });

  describe('assembleProductionStatistics', () => {
    it('should return hydrogen and power totals for valid hydrogen production steps when called', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenHydrogenProcessStepOne = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 10,
          active: true,
          details: QualityDetailsEntityFixture.create({
            rfnboType: RfnboType.RFNBO_READY,
          }),
          predecessors: [
            BatchEntityFixture.createPowerBatch({
              amount: 4,
              details: QualityDetailsEntityFixture.create({ productionPowerType: PowerType.RENEWABLE }),
            }),
          ],
        }),
      });
      const givenHydrogenProcessStepTwo = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'process-step-4',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'batch-4',
          processStepId: 'process-step-4',
          amount: 6,
          active: true,
          details: QualityDetailsEntityFixture.create({
            rfnboType: RfnboType.NON_CERTIFIABLE,
          }),
          predecessors: [
            BatchEntityFixture.createPowerBatch({
              id: 'power-batch-2',
              amount: 3,
              details: QualityDetailsEntityFixture.create({ productionPowerType: PowerType.PARTLY_RENEWABLE }),
            }),
            BatchEntityFixture.createPowerBatch({
              id: 'power-batch-3',
              amount: 5,
              details: QualityDetailsEntityFixture.create({ productionPowerType: PowerType.NON_RENEWABLE }),
            }),
          ],
        }),
      });
      const givenInactiveHydrogenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'process-step-5',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'batch-5',
          processStepId: 'process-step-5',
          amount: 99,
          active: false,
          details: QualityDetailsEntityFixture.create({
            rfnboType: RfnboType.RFNBO_READY,
          }),
          predecessors: [BatchEntityFixture.createWaterBatch({ id: 'water-batch-4', amount: 7 })],
        }),
      });

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([
        givenHydrogenProcessStepOne,
        givenHydrogenProcessStepTwo,
        givenInactiveHydrogenProcessStep,
      ]);

      // act
      const actualResult = await service.assembleProductionStatistics(givenPayload);

      // assert
      expect(processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate).toHaveBeenCalledWith(
        [ProcessType.POWER_PRODUCTION],
        givenPayload,
      );
      expect(actualResult.hydrogen).toEqual(
        expect.objectContaining({
          nonCertifiable: 6,
          rfnboReady: 10,
          total: 16,
        }),
      );
      expect(actualResult.power).toEqual(
        expect.objectContaining({
          renewable: 4,
          partlyRenewable: 3,
          nonRenewable: 5,
          total: 12,
        }),
      );
    });

    it('should throw when non-hydrogen process steps are returned', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenInvalidProcessStep = ProcessStepEntityFixture.createPowerProduction();

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([
        givenInvalidProcessStep,
      ]);

      // act & assert
      const actualResult = service.assembleProductionStatistics(givenPayload);

      await expect(actualResult).rejects.toThrow(
        `Expected only ${ProcessType.HYDROGEN_PRODUCTION} process steps, but received: ${ProcessType.POWER_PRODUCTION}`,
      );
    });

    it('should throw when a hydrogen batch has no RFNBO type', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          details: new BatchDetailsEntity('quality-details-2', undefined as never, PowerType.RENEWABLE, 0),
        }),
      });

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([givenProcessStep]);

      // act & assert
      const actualResult = service.assembleProductionStatistics(givenPayload);

      await expect(actualResult).rejects.toThrow(`Rfnbotype of ${givenProcessStep.id} not defined`);
    });

    it('should return zero statistics when no hydrogen production steps are found', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([]);

      // act
      const actualResult = await service.assembleProductionStatistics(givenPayload);

      // assert
      expect(actualResult.hydrogen).toEqual(
        expect.objectContaining({
          nonCertifiable: 0,
          rfnboReady: 0,
          total: 0,
        }),
      );
      expect(actualResult.power).toEqual(
        expect.objectContaining({
          renewable: 0,
          partlyRenewable: 0,
          nonRenewable: 0,
          total: 0,
        }),
      );
    });
  });
});
