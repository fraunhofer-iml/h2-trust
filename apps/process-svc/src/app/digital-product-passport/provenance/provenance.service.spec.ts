/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity, ProvenanceEntity, ReadByIdPayload } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProvenanceService } from './provenance.service';
import { TraversalService } from './traversal.service';
import { ProcessStepService } from '../../process-step/process-step.service';

function createProcessStep(id: string, type: ProcessType): ProcessStepEntity {
  return { id, type } as ProcessStepEntity;
}

describe('ProvenanceService', () => {
  let service: ProvenanceService;
  let processStepServiceMock: Record<string, jest.Mock>;
  let traversalServiceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    processStepServiceMock = {
      readProcessStep: jest.fn(),
    };

    traversalServiceMock = {
      fetchPowerProductionsFromHydrogenProductions: jest.fn(),
      fetchWaterConsumptionsFromHydrogenProductions: jest.fn(),
      fetchHydrogenProductionsFromHydrogenBottling: jest.fn(),
      fetchHydrogenBottlingFromHydrogenTransportation: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProvenanceService,
        { provide: ProcessStepService, useValue: processStepServiceMock },
        { provide: TraversalService, useValue: traversalServiceMock },
      ],
    }).compile();

    service = moduleRef.get(ProvenanceService);
  });

  describe('buildProvenance error paths', () => {
    it('throws when processStepId missing', async () => {
      await expect(service.buildProvenance(new ReadByIdPayload(''))).rejects.toThrow('processStepId must be provided.');
    });

    it('throws when root step has no type', async () => {
      processStepServiceMock['readProcessStep'].mockResolvedValue({ id: 'p1' });

      await expect(service.buildProvenance(new ReadByIdPayload('p1'))).rejects.toThrow('Invalid process step.');
    });

    it('throws when unsupported process type', async () => {
      const unknown = createProcessStep('p1', 'UNKNOWN' as ProcessType);

      processStepServiceMock['readProcessStep'].mockResolvedValue(unknown);

      await expect(service.buildProvenance(new ReadByIdPayload(unknown.id))).rejects.toThrow(
        'Unsupported process type [UNKNOWN].',
      );
    });
  });

  describe('strategies', () => {
    it(`builds provenance for ${ProcessType.POWER_PRODUCTION}`, async () => {
      // Arrange
      const powerProduction = createProcessStep('pp1', ProcessType.POWER_PRODUCTION);

      processStepServiceMock['readProcessStep'].mockResolvedValue(powerProduction);

      const expectedResult = new ProvenanceEntity(powerProduction, undefined, [], [], [powerProduction]);

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(new ReadByIdPayload(powerProduction.id));

      // Assert
      expect(actualResult.root).toBe(expectedResult.root);
      expect(actualResult.powerProductions).toEqual(expectedResult.powerProductions);
      expect(actualResult.waterConsumptions).toEqual(expectedResult.waterConsumptions);
      expect(actualResult.hydrogenProductions).toEqual(expectedResult.hydrogenProductions);
      expect(actualResult.hydrogenBottling).toBe(expectedResult.hydrogenBottling);

      expect(traversalServiceMock['fetchPowerProductionsFromHydrogenProductions']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation']).not.toHaveBeenCalled();
    });

    it(`builds provenance for ${ProcessType.WATER_CONSUMPTION}`, async () => {
      // Arrange
      const waterConsumption = createProcessStep('wc1', ProcessType.WATER_CONSUMPTION);

      processStepServiceMock['readProcessStep'].mockResolvedValue(waterConsumption);

      const expectedResult = new ProvenanceEntity(waterConsumption, undefined, [], [waterConsumption], []);

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(new ReadByIdPayload(waterConsumption.id));

      // Assert
      expect(actualResult.root).toBe(expectedResult.root);
      expect(actualResult.powerProductions).toEqual(expectedResult.powerProductions);
      expect(actualResult.waterConsumptions).toEqual(expectedResult.waterConsumptions);
      expect(actualResult.hydrogenProductions).toEqual(expectedResult.hydrogenProductions);
      expect(actualResult.hydrogenBottling).toBe(expectedResult.hydrogenBottling);

      expect(traversalServiceMock['fetchPowerProductionsFromHydrogenProductions']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation']).not.toHaveBeenCalled();
    });

    it(`builds provenance for ${ProcessType.HYDROGEN_PRODUCTION}`, async () => {
      // Arrange
      const hydrogenProduction = createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION);
      const waterConsumptions = [createProcessStep('wc1', ProcessType.WATER_CONSUMPTION)];
      const powerProductions = [createProcessStep('pp1', ProcessType.POWER_PRODUCTION)];

      processStepServiceMock['readProcessStep'].mockResolvedValue(hydrogenProduction);

      traversalServiceMock['fetchPowerProductionsFromHydrogenProductions'].mockResolvedValue(powerProductions);
      traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions'].mockResolvedValue(waterConsumptions);

      const expectedResult = new ProvenanceEntity(
        hydrogenProduction,
        undefined,
        [hydrogenProduction],
        waterConsumptions,
        powerProductions,
      );

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(new ReadByIdPayload(hydrogenProduction.id));

      // Assert
      expect(actualResult.root).toBe(expectedResult.root);
      expect(actualResult.powerProductions).toEqual(expectedResult.powerProductions);
      expect(actualResult.waterConsumptions).toEqual(expectedResult.waterConsumptions);
      expect(actualResult.hydrogenProductions).toEqual(expectedResult.hydrogenProductions);
      expect(actualResult.hydrogenBottling).toBe(expectedResult.hydrogenBottling);

      expect(traversalServiceMock['fetchPowerProductionsFromHydrogenProductions']).toHaveBeenCalledWith([
        hydrogenProduction,
      ]);
      expect(traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions']).toHaveBeenCalledWith([
        hydrogenProduction,
      ]);
      expect(traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling']).not.toHaveBeenCalled();
      expect(traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation']).not.toHaveBeenCalled();
    });

    it(`builds provenance for ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
      // Arrange
      const hydrogenBottling = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING);
      const hydrogenProductions = [createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION)];
      const waterConsumptions = [createProcessStep('wc1', ProcessType.WATER_CONSUMPTION)];
      const powerProductions = [createProcessStep('pp1', ProcessType.POWER_PRODUCTION)];

      processStepServiceMock['readProcessStep'].mockResolvedValue(hydrogenBottling);

      traversalServiceMock['fetchPowerProductionsFromHydrogenProductions'].mockResolvedValue(powerProductions);
      traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions'].mockResolvedValue(waterConsumptions);
      traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling'].mockResolvedValue(hydrogenProductions);

      const expectedResult = new ProvenanceEntity(
        hydrogenBottling,
        hydrogenBottling,
        hydrogenProductions,
        waterConsumptions,
        powerProductions,
      );

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(new ReadByIdPayload(hydrogenBottling.id));

      // Assert
      expect(actualResult.root).toBe(expectedResult.root);
      expect(actualResult.powerProductions).toEqual(expectedResult.powerProductions);
      expect(actualResult.waterConsumptions).toEqual(expectedResult.waterConsumptions);
      expect(actualResult.hydrogenProductions).toEqual(expectedResult.hydrogenProductions);
      expect(actualResult.hydrogenBottling).toBe(expectedResult.hydrogenBottling);

      expect(traversalServiceMock['fetchPowerProductionsFromHydrogenProductions']).toHaveBeenCalledWith(
        hydrogenProductions,
      );
      expect(traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions']).toHaveBeenCalledWith(
        hydrogenProductions,
      );
      expect(traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling']).toHaveBeenCalledWith(
        hydrogenBottling,
      );
      expect(traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation']).not.toHaveBeenCalled();
    });

    it(`builds provenance for ${ProcessType.HYDROGEN_TRANSPORTATION}`, async () => {
      // Arrange
      const hydrogenTransportation = createProcessStep('ht1', ProcessType.HYDROGEN_TRANSPORTATION);
      const powerProductions = [createProcessStep('pp1', ProcessType.POWER_PRODUCTION)];
      const waterConsumptions = [createProcessStep('wc1', ProcessType.WATER_CONSUMPTION)];
      const hydrogenProductions = [createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION)];
      const hydrogenBottling = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING);

      processStepServiceMock['readProcessStep'].mockResolvedValue(hydrogenTransportation);

      traversalServiceMock['fetchPowerProductionsFromHydrogenProductions'].mockResolvedValue(powerProductions);
      traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions'].mockResolvedValue(waterConsumptions);
      traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling'].mockResolvedValue(hydrogenProductions);
      traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation'].mockResolvedValue(hydrogenBottling);

      const expectedResult = new ProvenanceEntity(
        hydrogenTransportation,
        hydrogenBottling,
        hydrogenProductions,
        waterConsumptions,
        powerProductions,
      );

      // Act
      const actualResult: ProvenanceEntity = await service.buildProvenance(
        new ReadByIdPayload(hydrogenTransportation.id),
      );

      // Assert
      expect(actualResult.root).toBe(expectedResult.root);
      expect(actualResult.powerProductions).toEqual(expectedResult.powerProductions);
      expect(actualResult.waterConsumptions).toEqual(expectedResult.waterConsumptions);
      expect(actualResult.hydrogenProductions).toEqual(expectedResult.hydrogenProductions);
      expect(actualResult.hydrogenBottling).toBe(expectedResult.hydrogenBottling);

      expect(traversalServiceMock['fetchPowerProductionsFromHydrogenProductions']).toHaveBeenCalledWith(
        hydrogenProductions,
      );
      expect(traversalServiceMock['fetchWaterConsumptionsFromHydrogenProductions']).toHaveBeenCalledWith(
        hydrogenProductions,
      );
      expect(traversalServiceMock['fetchHydrogenProductionsFromHydrogenBottling']).toHaveBeenCalledWith(
        hydrogenBottling,
      );
      expect(traversalServiceMock['fetchHydrogenBottlingFromHydrogenTransportation']).toHaveBeenCalledWith(
        hydrogenTransportation,
      );
    });
  });
});
