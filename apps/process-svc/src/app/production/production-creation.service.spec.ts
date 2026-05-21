/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from '@h2-trust/configuration';
import { ConcreteUnitEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import {
  assembleHydrogenProductions,
  assemblePowerProductions,
  assembleWaterConsumptions,
} from './production.assembler';
import { ProductionCreationService } from './production-creation.service';

jest.mock('./production.assembler', () => ({
  assembleHydrogenProductions: jest.fn(),
  assemblePowerProductions: jest.fn(),
  assembleWaterConsumptions: jest.fn(),
}));

describe('ProductionCreationService', () => {
  let service: ProductionCreationService;

  const assemblePowerProductionsMock = jest.mocked(assemblePowerProductions);
  const assembleWaterConsumptionsMock = jest.mocked(assembleWaterConsumptions);
  const assembleHydrogenProductionsMock = jest.mocked(assembleHydrogenProductions);

  const configurationServiceMock = {
    getProcessSvcConfiguration: jest.fn().mockReturnValue({ productionChunkSize: 10 }),
  };

  const processStepServiceMock = {
    createManyProcessSteps: jest.fn(),
  };

  const digitalProductPassportServiceMock = {
    getRfnboType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionCreationService,
        {
          provide: ConfigurationService,
          useValue: configurationServiceMock,
        },
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
        {
          provide: DigitalProductPassportService,
          useValue: digitalProductPassportServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProductionCreationService>(ProductionCreationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAndPersistProductions', () => {
    it('persists power and water first, enriches hydrogen with RFNBO type, then persists hydrogen', async () => {
      // Arrange
      const givenCreateProduction = {
        productionStartedAt: new Date('2026-01-01T01:00:00Z'),
        productionEndedAt: new Date('2026-01-01T01:59:59Z'),
        powerProductionUnitId: 'power-unit-1',
        powerType: PowerType.RENEWABLE,
        powerAmountKwh: 100,
        hydrogenProductionUnitId: 'hydrogen-unit-1',
        hydrogenAmountKg: 10,
        recordedBy: 'user-1',
        hydrogenStorageUnitId: 'storage-unit-1',
        ownerIdOfPowerProductionUnit: 'power-owner-1',
        ownerIdOfHydrogenProductionUnit: 'hydrogen-owner-1',
        waterConsumptionLitersPerHour: 20,
      };
      const givenProductionUnitsForId = new Map<string, ConcreteUnitEntity>([
        ['power-unit-1', PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' })],
        ['hydrogen-unit-1', HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })],
      ]);
      const givenPowerToPersist = ProcessStepEntityFixture.createPowerProduction({
        id: 'power-to-persist',
        batch: BatchEntityFixture.createPowerBatch({ id: 'power-batch-to-persist', processStepId: 'power-to-persist' }),
      });
      const givenWaterToPersist = ProcessStepEntityFixture.createWaterConsumption({
        id: 'water-to-persist',
        batch: BatchEntityFixture.createWaterBatch({ id: 'water-batch-to-persist', processStepId: 'water-to-persist' }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenPersistedPower = ProcessStepEntityFixture.createPowerProduction({
        id: 'persisted-power',
        batch: BatchEntityFixture.createPowerBatch({ id: 'persisted-power-batch', processStepId: 'persisted-power' }),
      });
      const givenPersistedWater = ProcessStepEntityFixture.createWaterConsumption({
        id: 'persisted-water',
        batch: BatchEntityFixture.createWaterBatch({ id: 'persisted-water-batch', processStepId: 'persisted-water' }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenHydrogenToPersist = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'hydrogen-to-persist',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'hydrogen-batch-to-persist',
          processStepId: 'hydrogen-to-persist',
          predecessors: [givenPersistedPower.batch, givenPersistedWater.batch],
          qualityDetails: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.NOT_SPECIFIED }),
        }),
      });
      const givenPersistedHydrogen = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'persisted-hydrogen',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'persisted-hydrogen-batch',
          processStepId: 'persisted-hydrogen',
        }),
      });

      assemblePowerProductionsMock.mockReturnValue([givenPowerToPersist]);
      assembleWaterConsumptionsMock.mockReturnValue([givenWaterToPersist]);
      assembleHydrogenProductionsMock.mockReturnValue([givenHydrogenToPersist]);
      processStepServiceMock.createManyProcessSteps
        .mockResolvedValueOnce([givenPersistedPower, givenPersistedWater])
        .mockResolvedValueOnce([givenPersistedHydrogen]);
      digitalProductPassportServiceMock.getRfnboType.mockReturnValue(RfnboType.RFNBO_READY);

      // Act
      const actualResult = await service.createAndPersistProductions([givenCreateProduction], givenProductionUnitsForId);

      // Assert
      expect(processStepServiceMock.createManyProcessSteps).toHaveBeenCalledTimes(2);
      expect(processStepServiceMock.createManyProcessSteps.mock.calls[0][0].processSteps).toEqual([
        givenPowerToPersist,
        givenWaterToPersist,
      ]);
      expect(digitalProductPassportServiceMock.getRfnboType).toHaveBeenCalledTimes(1);
      expect(givenHydrogenToPersist.batch.qualityDetails.rfnboType).toBe(RfnboType.RFNBO_READY);
      expect(processStepServiceMock.createManyProcessSteps.mock.calls[1][0].processSteps).toEqual([
        givenHydrogenToPersist,
      ]);
      expect(actualResult).toEqual([givenPersistedPower, givenPersistedWater, givenPersistedHydrogen]);
    });

    it('throws when assembled power and water do not match the given productions 1:1', async () => {
      // Arrange
      const givenCreateProduction = {
        productionStartedAt: new Date('2026-01-01T01:00:00Z'),
        productionEndedAt: new Date('2026-01-01T01:59:59Z'),
        powerProductionUnitId: 'power-unit-1',
        powerType: PowerType.RENEWABLE,
        powerAmountKwh: 100,
        hydrogenProductionUnitId: 'hydrogen-unit-1',
        hydrogenAmountKg: 10,
        recordedBy: 'user-1',
        hydrogenStorageUnitId: 'storage-unit-1',
        ownerIdOfPowerProductionUnit: 'power-owner-1',
        ownerIdOfHydrogenProductionUnit: 'hydrogen-owner-1',
        waterConsumptionLitersPerHour: 20,
      };

      assemblePowerProductionsMock.mockReturnValue([]);
      assembleWaterConsumptionsMock.mockReturnValue([ProcessStepEntityFixture.createWaterConsumption()]);

      // Act & Assert
      await expect(service.createAndPersistProductions([givenCreateProduction], new Map())).rejects.toThrow(
        'Expected 1:1 relation between given productions and created process steps, but got 0 power and 1 water for 1 productions.',
      );
      expect(processStepServiceMock.createManyProcessSteps).not.toHaveBeenCalled();
    });

    it('throws when persisted power and water counts differ', async () => {
      // Arrange
      const givenCreateProduction = {
        productionStartedAt: new Date('2026-01-01T01:00:00Z'),
        productionEndedAt: new Date('2026-01-01T01:59:59Z'),
        powerProductionUnitId: 'power-unit-1',
        powerType: PowerType.RENEWABLE,
        powerAmountKwh: 100,
        hydrogenProductionUnitId: 'hydrogen-unit-1',
        hydrogenAmountKg: 10,
        recordedBy: 'user-1',
        hydrogenStorageUnitId: 'storage-unit-1',
        ownerIdOfPowerProductionUnit: 'power-owner-1',
        ownerIdOfHydrogenProductionUnit: 'hydrogen-owner-1',
        waterConsumptionLitersPerHour: 20,
      };

      assemblePowerProductionsMock.mockReturnValue([ProcessStepEntityFixture.createPowerProduction()]);
      assembleWaterConsumptionsMock.mockReturnValue([ProcessStepEntityFixture.createWaterConsumption()]);
      processStepServiceMock.createManyProcessSteps.mockResolvedValue([ProcessStepEntityFixture.createPowerProduction()]);

      // Act & Assert
      await expect(service.createAndPersistProductions([givenCreateProduction], new Map())).rejects.toThrow(
        'Expected 1:1 relation between power and water process steps, but got 1 power and 0 water.',
      );
    });
  });
});