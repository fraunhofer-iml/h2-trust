/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { QualityDetailsEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
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
import { EnergySource, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
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
    it('loads units and delegates the assembled production entities', async () => {
      // Arrange
      const givenPayload = CreateProductionsPayloadFixture.create();
      const givenPowerProductionUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.powerProductionUnitId,
        owner: { id: 'power-owner-1' },
        type: {
          ...PowerProductionUnitEntityFixture.create().type,
          energySource: EnergySource.SOLAR_ENERGY,
        },
      });
      const givenHydrogenProductionUnit = HydrogenProductionUnitEntityFixture.create({
        id: givenPayload.hydrogenProductionUnitId,
        owner: { id: 'hydrogen-owner-1' },
        waterConsumptionLitersPerHour: 25,
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

      // Act
      const actualResult = await service.createProductions(givenPayload);

      // Assert
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
          hydrogenStorageUnitId: givenPayload.hydrogenStorageUnitId,
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
  });

  describe('assembleProductionStatistics', () => {
    it('returns hydrogen and power totals for valid hydrogen production steps', async () => {
      // Arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenHydrogenProcessStepOne = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 10,
          active: true,
          qualityDetails: QualityDetailsEntityFixture.create({
            rfnboType: RfnboType.RFNBO_READY,
          }),
          predecessors: [
            BatchEntityFixture.createPowerBatch({
              amount: 4,
              qualityDetails: QualityDetailsEntityFixture.create({ powerType: PowerType.RENEWABLE }),
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
          qualityDetails: QualityDetailsEntityFixture.create({
            rfnboType: RfnboType.NON_CERTIFIABLE,
          }),
          predecessors: [
            BatchEntityFixture.createPowerBatch({
              id: 'power-batch-2',
              amount: 3,
              qualityDetails: QualityDetailsEntityFixture.create({ powerType: PowerType.PARTLY_RENEWABLE }),
            }),
            BatchEntityFixture.createPowerBatch({
              id: 'power-batch-3',
              amount: 5,
              qualityDetails: QualityDetailsEntityFixture.create({ powerType: PowerType.NON_RENEWABLE }),
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
          qualityDetails: QualityDetailsEntityFixture.create({
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

      // Act
      const actualResult = await service.assembleProductionStatistics(givenPayload);

      // Assert
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

    it('throws when non-hydrogen process steps are returned', async () => {
      // Arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenInvalidProcessStep = ProcessStepEntityFixture.createPowerProduction();

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([
        givenInvalidProcessStep,
      ]);

      // Act & Assert
      await expect(service.assembleProductionStatistics(givenPayload)).rejects.toThrow(
        `Expected only ${ProcessType.HYDROGEN_PRODUCTION} process steps, but received: ${ProcessType.POWER_PRODUCTION}`,
      );
    });

    it('throws when a hydrogen batch has no RFNBO type', async () => {
      // Arrange
      const givenPayload = CreateHydrogenProductionStatisticsPayloadFixture.create();
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          qualityDetails: new QualityDetailsEntity('quality-details-2', undefined as never, PowerType.RENEWABLE),
        }),
      });

      processStepServiceMock.readProcessStepsByPredecessorTypesAndUnitAndDate.mockResolvedValue([givenProcessStep]);

      // Act & Assert
      await expect(service.assembleProductionStatistics(givenPayload)).rejects.toThrow(
        `Rfnbotype of ${givenProcessStep.id} not defined`,
      );
    });
  });
});