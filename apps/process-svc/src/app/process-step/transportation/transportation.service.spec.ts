/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CreateHydrogenTransportationPayload } from '@h2-trust/amqp';
import { BatchType, FuelType, ProcessType, TransportMode } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from '../process-step.service';
import { TransportationService } from './transportation.service';
import { TransportationErrorMessages } from '../../constants';

describe('TransportationService', () => {
  let service: TransportationService;

  const processStepServiceMock = {
    createProcessStep: jest.fn(),
    setBatchesInactive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportationService,
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
      ],
    }).compile();

    service = module.get<TransportationService>(TransportationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createHydrogenTransportationProcessStep', () => {
    it('creates transportation process step with trailer transport mode', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportMode.TRAILER,
        100,
        FuelType.DIESEL,
      );

      const expectedTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      processStepServiceMock.createProcessStep.mockResolvedValue(expectedTransportation);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });

      // Act
      const actualResult = await service.createHydrogenTransportationProcessStep(givenPayload);

      // Assert
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ProcessType.HYDROGEN_TRANSPORTATION,
          batch: expect.objectContaining({
            type: BatchType.HYDROGEN,
            predecessors: [givenPredecessorBatch],
          }),
          transportationDetails: expect.objectContaining({
            distance: givenPayload.distance,
            transportMode: givenPayload.transportMode,
            fuelType: givenPayload.fuelType,
          }),
        }),
      );
      expect(actualResult).toEqual(expectedTransportation);
    });

    it('creates transportation process step with pipeline transport mode', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportMode.PIPELINE,
        undefined,
        undefined,
      );

      const expectedTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      processStepServiceMock.createProcessStep.mockResolvedValue(expectedTransportation);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });

      // Act
      const actualResult = await service.createHydrogenTransportationProcessStep(givenPayload);

      // Assert
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ProcessType.HYDROGEN_TRANSPORTATION,
          batch: expect.objectContaining({
            type: BatchType.HYDROGEN,
            predecessors: [givenPredecessorBatch],
          }),
          transportationDetails: expect.objectContaining({
            distance: 0,
            transportMode: givenPayload.transportMode,
            fuelType: givenPayload.fuelType,
          }),
        }),
      );
      expect(actualResult).toEqual(expectedTransportation);
    });

    it('throws error when trailer transport mode has no distance', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportMode.TRAILER,
        undefined,
        FuelType.DIESEL,
      );

      // Act & Assert
      await expect(service.createHydrogenTransportationProcessStep(givenPayload)).rejects.toThrow(
        TransportationErrorMessages.DISTANCE_REQUIRED_FOR_TRAILER,
      );
    });

    it('throws error when trailer transport mode has no fuel type', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportMode.TRAILER,
        100,
        undefined,
      );

      // Act & Assert
      await expect(service.createHydrogenTransportationProcessStep(givenPayload)).rejects.toThrow(
        TransportationErrorMessages.FUEL_TYPE_REQUIRED_FOR_TRAILER,
      );
    });

    it('throws error for invalid transport mode', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        'INVALID' as TransportMode,
        100,
        FuelType.DIESEL,
      );

      // Act & Assert
      await expect(service.createHydrogenTransportationProcessStep(givenPayload)).rejects.toThrow(
        TransportationErrorMessages.INVALID_TRANSPORT_MODE(givenPayload.transportMode),
      );
    });
  });
});
