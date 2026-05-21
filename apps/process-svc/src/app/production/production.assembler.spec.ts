/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ConcreteUnitEntity,
  CreateProductionEntity,
  ProcessStepEntity,
  QualityDetailsEntity,
} from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BatchType, PowerType, ProcessType } from '@h2-trust/domain';
import {
  assembleHydrogenProductions,
  assemblePowerProductions,
  assembleWaterConsumptions,
} from './production.assembler';

describe('ProductionAssembler', () => {
  const createProduction = new CreateProductionEntity(
    new Date('2026-01-01T01:15:00Z'),
    new Date('2026-01-01T02:45:00Z'),
    'power-unit-1',
    PowerType.RENEWABLE,
    90,
    'hydrogen-unit-1',
    30,
    'user-1',
    'storage-unit-1',
    'power-owner-1',
    'hydrogen-owner-1',
    60,
  );

  const productionUnitsForId = new Map<string, ConcreteUnitEntity>([
    ['power-unit-1', PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' })],
    ['hydrogen-unit-1', HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })],
    ['storage-unit-1', HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' })],
  ]);

  describe('assemblePowerProductions', () => {
    it('should create hourly power process steps with renewable quality details when called', () => {
      // act
      const actualResult = assemblePowerProductions(createProduction, productionUnitsForId);

      // assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult[0]).toEqual(
        expect.objectContaining({
          type: ProcessType.POWER_PRODUCTION,
          startedAt: new Date('2026-01-01T01:00:00Z'),
          endedAt: new Date('2026-01-01T01:59:59Z'),
          executedBy: productionUnitsForId.get('power-unit-1'),
        }),
      );
      expect(actualResult[1]).toEqual(
        expect.objectContaining({
          type: ProcessType.POWER_PRODUCTION,
          startedAt: new Date('2026-01-01T02:00:00Z'),
          endedAt: new Date('2026-01-01T02:59:59Z'),
          executedBy: productionUnitsForId.get('power-unit-1'),
        }),
      );
      expect(actualResult.map((processStep) => processStep.batch.amount)).toEqual([45, 45]);
      expect(actualResult.every((processStep) => processStep.batch.type === BatchType.POWER)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.active === false)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.predecessors.length === 0)).toBe(true);
      expect(actualResult.map((processStep) => processStep.batch.qualityDetails?.powerType)).toEqual([
        PowerType.RENEWABLE,
        PowerType.RENEWABLE,
      ]);
    });

    it('should throw when the power production unit is missing', () => {
      const givenUnitsWithoutPower = new Map<string, ConcreteUnitEntity>([
        ['hydrogen-unit-1', HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })],
      ]);

      expect(() => assemblePowerProductions(createProduction, givenUnitsWithoutPower)).toThrow('powerProductionUnit');
    });
  });

  describe('assembleWaterConsumptions', () => {
    it('should create hourly water consumption process steps with calculated batch amounts when called', () => {
      // act
      const actualResult = assembleWaterConsumptions(createProduction, productionUnitsForId);

      // assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult.map((processStep) => processStep.batch.amount)).toEqual([45, 45]);
      expect(actualResult.every((processStep) => processStep.type === ProcessType.WATER_CONSUMPTION)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.type === BatchType.WATER)).toBe(true);
      expect(actualResult.every((processStep) => processStep.executedBy?.id === 'hydrogen-unit-1')).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.active === false)).toBe(true);
    });
  });

  describe('assembleHydrogenProductions', () => {
    it('should create hydrogen process steps with hourly predecessor batches and storage unit reference when called', () => {
      // arrange
      const givenPowerProductions: ProcessStepEntity[] = [
        ProcessStepEntityFixture.createPowerProduction({
          id: 'power-1',
          startedAt: new Date('2026-01-01T01:00:00Z'),
          endedAt: new Date('2026-01-01T01:59:59Z'),
          batch: BatchEntityFixture.createPowerBatch({
            id: 'power-batch-1',
            processStepId: 'power-1',
            amount: 45,
            qualityDetails: new QualityDetailsEntity('quality-1', undefined as never, PowerType.PARTLY_RENEWABLE),
          }),
        }),
        ProcessStepEntityFixture.createPowerProduction({
          id: 'power-2',
          startedAt: new Date('2026-01-01T02:00:00Z'),
          endedAt: new Date('2026-01-01T02:59:59Z'),
          batch: BatchEntityFixture.createPowerBatch({
            id: 'power-batch-2',
            processStepId: 'power-2',
            amount: 45,
            qualityDetails: new QualityDetailsEntity('quality-2', undefined as never, PowerType.PARTLY_RENEWABLE),
          }),
        }),
      ];
      const givenWaterConsumptions: ProcessStepEntity[] = [
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'water-1',
          startedAt: new Date('2026-01-01T01:00:00Z'),
          endedAt: new Date('2026-01-01T01:59:59Z'),
          batch: BatchEntityFixture.createWaterBatch({
            id: 'water-batch-1',
            processStepId: 'water-1',
            amount: 45,
          }),
        }),
        ProcessStepEntityFixture.createWaterConsumption({
          id: 'water-2',
          startedAt: new Date('2026-01-01T02:00:00Z'),
          endedAt: new Date('2026-01-01T02:59:59Z'),
          batch: BatchEntityFixture.createWaterBatch({
            id: 'water-batch-2',
            processStepId: 'water-2',
            amount: 45,
          }),
        }),
      ];

      // act
      const actualResult = assembleHydrogenProductions(
        createProduction,
        givenPowerProductions,
        givenWaterConsumptions,
        productionUnitsForId,
      );

      // assert
      expect(actualResult).toHaveLength(2);
      expect(actualResult.map((processStep) => processStep.batch.amount)).toEqual([15, 15]);
      expect(actualResult.every((processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.type === BatchType.HYDROGEN)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.active === true)).toBe(true);
      expect(actualResult.every((processStep) => processStep.batch.hydrogenStorageUnit?.id === 'storage-unit-1')).toBe(
        true,
      );
      expect(actualResult.map((processStep) => processStep.batch.qualityDetails?.powerType)).toEqual([
        PowerType.PARTLY_RENEWABLE,
        PowerType.PARTLY_RENEWABLE,
      ]);
      expect(actualResult[0].batch.predecessors.map((predecessor) => predecessor.id)).toEqual([
        'power-batch-1',
        'water-batch-1',
      ]);
      expect(actualResult[1].batch.predecessors.map((predecessor) => predecessor.id)).toEqual([
        'power-batch-2',
        'water-batch-2',
      ]);
    });
  });
});