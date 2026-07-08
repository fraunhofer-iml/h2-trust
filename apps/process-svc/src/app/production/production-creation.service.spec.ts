/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from '@h2-trust/configuration';
import { CreateProductionEntity, UnitEntity } from '@h2-trust/contracts/entities';
import {
  BatchDetailsEntityFixture,
  BatchEntityFixture,
  HydrogenProductionUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionCreationService } from './production-creation.service';
import {
  assembleHydrogenProductions,
  assemblePowerProductions,
  assembleWaterConsumptions,
} from './production.assembler';

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
    saveManyProcessSteps: jest.fn(),
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
    it('should process productions across multiple chunks using the configured chunk size when called', async () => {
      // arrange
      const givenConfigurationServiceMock = {
        getProcessSvcConfiguration: jest.fn().mockReturnValue({ productionChunkSize: 1 }),
      };
      const givenService = new ProductionCreationService(
        givenConfigurationServiceMock as unknown as ConfigurationService,
        processStepServiceMock as unknown as ProcessStepService,
        digitalProductPassportServiceMock as unknown as DigitalProductPassportService,
      );
      const givenFirstCreateProduction = new CreateProductionEntity(
        new Date('2026-01-01T01:00:00Z'),
        new Date('2026-01-01T01:59:59Z'),
        'power-unit-1',
        PowerType.RENEWABLE,
        100,
        'hydrogen-unit-1',
        10,
        'user-1',
        'power-owner-1',
        'hydrogen-owner-1',
        20,
      );
      const givenSecondCreateProduction = new CreateProductionEntity(
        new Date('2026-01-01T02:00:00Z'),
        new Date('2026-01-01T02:59:59Z'),
        'power-unit-1',
        PowerType.RENEWABLE,
        120,
        'hydrogen-unit-1',
        12,
        'user-1',
        'power-owner-1',
        'hydrogen-owner-1',
        24,
      );
      const givenProductionUnitsForId = new Map<string, UnitEntity>([
        ['power-unit-1', PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' })],
        ['hydrogen-unit-1', HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })],
      ]);
      const givenPowerProcessStepsToPersist = [
        ProcessStepEntityFixture.createPowerProduction({
          id: 'power-to-persist-1',
          batch: BatchEntityFixture.createPowerBatch({
            id: 'power-batch-to-persist-1',
            processStepId: 'power-to-persist-1',
          }),
        }),
        ProcessStepEntityFixture.createPowerProduction({
          id: 'power-to-persist-2',
          batch: BatchEntityFixture.createPowerBatch({
            id: 'power-batch-to-persist-2',
            processStepId: 'power-to-persist-2',
          }),
        }),
      ];
      const givenWaterProcessStepsToPersist = [
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'water-to-persist-1',
          batch: BatchEntityFixture.createWaterBatch({
            id: 'water-batch-to-persist-1',
            processStepId: 'water-to-persist-1',
          }),
          executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
        }),
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'water-to-persist-2',
          batch: BatchEntityFixture.createWaterBatch({
            id: 'water-batch-to-persist-2',
            processStepId: 'water-to-persist-2',
          }),
          executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
        }),
      ];
      const expectedPersistedPowerProcessSteps = [
        ProcessStepEntityFixture.createPowerProduction({
          id: 'persisted-power-1',
          batch: BatchEntityFixture.createPowerBatch({
            id: 'persisted-power-batch-1',
            processStepId: 'persisted-power-1',
          }),
        }),
        ProcessStepEntityFixture.createPowerProduction({
          id: 'persisted-power-2',
          batch: BatchEntityFixture.createPowerBatch({
            id: 'persisted-power-batch-2',
            processStepId: 'persisted-power-2',
          }),
        }),
      ];
      const expectedPersistedWaterProcessSteps = [
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'persisted-water-1',
          batch: BatchEntityFixture.createWaterBatch({
            id: 'persisted-water-batch-1',
            processStepId: 'persisted-water-1',
          }),
          executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
        }),
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'persisted-water-2',
          batch: BatchEntityFixture.createWaterBatch({
            id: 'persisted-water-batch-2',
            processStepId: 'persisted-water-2',
          }),
          executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
        }),
      ];
      const givenHydrogenProcessStepsToPersist = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'hydrogen-to-persist-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'hydrogen-batch-to-persist-1',
            processStepId: 'hydrogen-to-persist-1',
            predecessors: [expectedPersistedPowerProcessSteps[0].batch, expectedPersistedWaterProcessSteps[0].batch],
            details: BatchDetailsEntityFixture.create({ rfnboType: RfnboType.NOT_SPECIFIED }),
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'hydrogen-to-persist-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'hydrogen-batch-to-persist-2',
            processStepId: 'hydrogen-to-persist-2',
            predecessors: [expectedPersistedPowerProcessSteps[1].batch, expectedPersistedWaterProcessSteps[1].batch],
            details: BatchDetailsEntityFixture.create({ rfnboType: RfnboType.NOT_SPECIFIED }),
          }),
        }),
      ];
      const expectedPersistedHydrogenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'persisted-hydrogen-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'persisted-hydrogen-batch-1',
            processStepId: 'persisted-hydrogen-1',
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'persisted-hydrogen-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'persisted-hydrogen-batch-2',
            processStepId: 'persisted-hydrogen-2',
          }),
        }),
      ];

      assemblePowerProductionsMock
        .mockReturnValueOnce([givenPowerProcessStepsToPersist[0]])
        .mockReturnValueOnce([givenPowerProcessStepsToPersist[1]]);
      assembleWaterConsumptionsMock
        .mockReturnValueOnce([givenWaterProcessStepsToPersist[0]])
        .mockReturnValueOnce([givenWaterProcessStepsToPersist[1]]);
      assembleHydrogenProductionsMock
        .mockReturnValueOnce([givenHydrogenProcessStepsToPersist[0]])
        .mockReturnValueOnce([givenHydrogenProcessStepsToPersist[1]]);
      processStepServiceMock.saveManyProcessSteps
        .mockResolvedValueOnce([expectedPersistedPowerProcessSteps[0], expectedPersistedWaterProcessSteps[0]])
        .mockResolvedValueOnce([expectedPersistedHydrogenProcessSteps[0]])
        .mockResolvedValueOnce([expectedPersistedPowerProcessSteps[1], expectedPersistedWaterProcessSteps[1]])
        .mockResolvedValueOnce([expectedPersistedHydrogenProcessSteps[1]]);
      digitalProductPassportServiceMock.getRfnboType
        .mockReturnValueOnce(RfnboType.RFNBO_READY)
        .mockReturnValueOnce(RfnboType.NON_CERTIFIABLE);

      // act
      const actualResult = await givenService.createAndPersistProductions(
        [givenFirstCreateProduction, givenSecondCreateProduction],
        givenProductionUnitsForId,
      );

      // assert
      expect(processStepServiceMock.saveManyProcessSteps).toHaveBeenCalledTimes(4);
      expect(digitalProductPassportServiceMock.getRfnboType).toHaveBeenCalledTimes(2);
      expect(givenHydrogenProcessStepsToPersist[0].batch.details.rfnboType).toBe(RfnboType.RFNBO_READY);
      expect(givenHydrogenProcessStepsToPersist[1].batch.details.rfnboType).toBe(RfnboType.NON_CERTIFIABLE);
      expect(actualResult).toEqual([
        expectedPersistedPowerProcessSteps[0],
        expectedPersistedWaterProcessSteps[0],
        expectedPersistedHydrogenProcessSteps[0],
        expectedPersistedPowerProcessSteps[1],
        expectedPersistedWaterProcessSteps[1],
        expectedPersistedHydrogenProcessSteps[1],
      ]);
    });

    it('should persist power and water first, enrich hydrogen with RFNBO type, and then persist hydrogen when called', async () => {
      // arrange
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
      const givenProductionUnitsForId = new Map<string, UnitEntity>([
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
          details: BatchDetailsEntityFixture.create({ rfnboType: RfnboType.NOT_SPECIFIED }),
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
      processStepServiceMock.saveManyProcessSteps
        .mockResolvedValueOnce([givenPersistedPower, givenPersistedWater])
        .mockResolvedValueOnce([givenPersistedHydrogen]);
      digitalProductPassportServiceMock.getRfnboType.mockReturnValue(RfnboType.RFNBO_READY);

      // act
      const actualResult = await service.createAndPersistProductions(
        [givenCreateProduction],
        givenProductionUnitsForId,
      );

      // assert
      expect(processStepServiceMock.saveManyProcessSteps).toHaveBeenCalledTimes(2);
      expect(processStepServiceMock.saveManyProcessSteps.mock.calls[0][0].processSteps).toEqual([
        givenPowerToPersist,
        givenWaterToPersist,
      ]);
      expect(digitalProductPassportServiceMock.getRfnboType).toHaveBeenCalledTimes(1);
      expect(givenHydrogenToPersist.batch.details.rfnboType).toBe(RfnboType.RFNBO_READY);
      expect(processStepServiceMock.saveManyProcessSteps.mock.calls[1][0].processSteps).toEqual([
        givenHydrogenToPersist,
      ]);
      expect(actualResult).toEqual([givenPersistedPower, givenPersistedWater, givenPersistedHydrogen]);
    });

    it('should throw when assembled power and water do not match the given productions 1:1', async () => {
      // arrange
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

      // act & assert
      const actualResult = service.createAndPersistProductions([givenCreateProduction], new Map());

      await expect(actualResult).rejects.toThrow(
        'Expected 1:1 relation between given productions and created process steps, but got 0 power and 1 water for 1 productions.',
      );
      expect(processStepServiceMock.saveManyProcessSteps).not.toHaveBeenCalled();
    });

    it('should throw when persisted power and water counts differ', async () => {
      // arrange
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
      processStepServiceMock.saveManyProcessSteps.mockResolvedValue([ProcessStepEntityFixture.createPowerProduction()]);

      // act & assert
      const actualResult = service.createAndPersistProductions([givenCreateProduction], new Map());

      await expect(actualResult).rejects.toThrow(
        'Expected 1:1 relation between power and water process steps, but got 1 power and 0 water.',
      );
    });

    it('should throw when hydrogen predecessors cannot be resolved back to persisted power and water process steps', async () => {
      // arrange
      const givenCreateProduction = new CreateProductionEntity(
        new Date('2026-01-01T01:00:00Z'),
        new Date('2026-01-01T01:59:59Z'),
        'power-unit-1',
        PowerType.RENEWABLE,
        100,
        'hydrogen-unit-1',
        10,
        'user-1',
        'power-owner-1',
        'hydrogen-owner-1',
        20,
      );
      const givenPersistedPower = ProcessStepEntityFixture.createPowerProduction({
        id: 'persisted-power',
        batch: BatchEntityFixture.createPowerBatch({ id: 'persisted-power-batch', processStepId: 'persisted-power' }),
      });
      const givenPersistedWater = ProcessStepEntityFixture.createWaterConsumption({
        id: 'persisted-water',
        batch: BatchEntityFixture.createWaterBatch({ id: 'persisted-water-batch', processStepId: 'persisted-water' }),
        executedBy: HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      });
      const givenHydrogenWithUnknownPredecessor = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createPowerBatch({ id: 'unknown-power-batch', processStepId: 'unknown-power' }),
            givenPersistedWater.batch,
          ],
          details: BatchDetailsEntityFixture.create({ rfnboType: RfnboType.NOT_SPECIFIED }),
        }),
      });

      assemblePowerProductionsMock.mockReturnValue([ProcessStepEntityFixture.createPowerProduction()]);
      assembleWaterConsumptionsMock.mockReturnValue([ProcessStepEntityFixture.createWaterConsumption()]);
      assembleHydrogenProductionsMock.mockReturnValue([givenHydrogenWithUnknownPredecessor]);
      processStepServiceMock.saveManyProcessSteps.mockResolvedValueOnce([givenPersistedPower, givenPersistedWater]);

      // act & assert
      const actualResult = service.createAndPersistProductions([givenCreateProduction], new Map());

      await expect(actualResult).rejects.toThrow('powerProduction');
      expect(digitalProductPassportServiceMock.getRfnboType).not.toHaveBeenCalled();
    });
  });
});
