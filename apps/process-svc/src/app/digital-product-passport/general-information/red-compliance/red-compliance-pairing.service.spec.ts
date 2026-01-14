/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { BrokerQueues, ProcessStepEntity, ReadByIdsPayload, UnitMessagePatterns } from '@h2-trust/amqp';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { RedCompliancePairingService } from './red-compliance-pairing.service';
import { MatchedProductionPair } from './matched-production-pair';

describe('RedCompliancePairingService', () => {
  let service: RedCompliancePairingService;

  const generalSvcMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedCompliancePairingService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
      ],
    }).compile();

    service = module.get<RedCompliancePairingService>(RedCompliancePairingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildMatchedPairs', () => {
    it('returns empty array when no power process steps are provided', async () => {
      // Arrange
      const givenPowerProcessSteps = [] as ProcessStepEntity[];
      const givenHydrogenProcessSteps = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenProcessStepId = 'process-step-1';

      const expectedResponse = [] as MatchedProductionPair[];

      // Act
      const actualResult = await service.buildMatchedPairs(
        givenPowerProcessSteps,
        givenHydrogenProcessSteps,
        givenProcessStepId,
      );

      // Assert
      expect(actualResult).toEqual(expectedResponse);
      expect(generalSvcMock.send).not.toHaveBeenCalled();
    });

    it('returns empty array when no hydrogen process steps are provided', async () => {
      // Arrange
      const givenPowerProcessSteps = [ProcessStepEntityFixture.createPowerProduction()];
      const givenHydrogenProcessSteps = [] as ProcessStepEntity[];

      const givenProcessStepId = 'process-step-1';

      const expectedResponse = [] as MatchedProductionPair[];

      // Act
      const actualResult = await service.buildMatchedPairs(
        givenPowerProcessSteps,
        givenHydrogenProcessSteps,
        givenProcessStepId,
      );

      // Assert
      expect(actualResult).toEqual(expectedResponse);
      expect(generalSvcMock.send).not.toHaveBeenCalled();
    });

    it('returns empty array when no matching pairs are found', async () => {
      // Arrange
      const givenPowerProcessSteps = [ProcessStepEntityFixture.createPowerProduction()];
      const givenHydrogenProcessSteps = [ProcessStepEntityFixture.createWaterConsumption()];

      const givenProcessStepId = 'process-step-1';

      const expectedResponse = [] as MatchedProductionPair[];

      // Act
      const actualResult = await service.buildMatchedPairs(
        givenPowerProcessSteps,
        givenHydrogenProcessSteps,
        givenProcessStepId,
      );

      // Assert
      expect(actualResult).toEqual(expectedResponse);
      expect(generalSvcMock.send).not.toHaveBeenCalled();
    });

    it('returns matched pairs with units when matching power and hydrogen productions exist', async () => {
      // Arrange
      const givenPowerProcessStep = ProcessStepEntityFixture.createPowerProduction();
      const givenHydrogenProcessStep = ProcessStepEntityFixture.createWaterConsumption();

      givenPowerProcessStep.batch.successors = [givenHydrogenProcessStep.batch];
      givenHydrogenProcessStep.batch.predecessors = [givenPowerProcessStep.batch];

      const givenProcessStepId = 'process-step-1';

      generalSvcMock.send.mockImplementation((pattern) => {
        if (pattern === UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS) {
          return of([givenPowerProcessStep.executedBy]);
        }
        if (pattern === UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS) {
          return of([givenHydrogenProcessStep.executedBy]);
        }
        return of([]);
      });

      // Act
      const actualResult = await service.buildMatchedPairs(
        [givenPowerProcessStep],
        [givenHydrogenProcessStep],
        givenProcessStepId,
      );

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].power.processStep).toBe(givenPowerProcessStep);
      expect(actualResult[0].power.unit).toBe(givenPowerProcessStep.executedBy);
      expect(actualResult[0].hydrogen.processStep).toBe(givenHydrogenProcessStep);
      expect(actualResult[0].hydrogen.unit).toBe(givenHydrogenProcessStep.executedBy);

      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS,
        new ReadByIdsPayload([givenPowerProcessStep.executedBy.id]),
      );
      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS,
        new ReadByIdsPayload([givenHydrogenProcessStep.executedBy.id]),
      );
    });
  });
});
