/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BatchEntityFixture, ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CreateHydrogenTransportationPayload } from '@h2-trust/contracts/payloads';
import { BatchType, FuelType, ProcessType, TransportType } from '@h2-trust/domain';
import { TransportationService } from './process-step-validator';
import { ProcessStepService } from './process-step.service';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createHydrogenTransportationProcessStep', () => {
    it('should create transportation process step with trailer transport mode when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.TRAILER,
        100,
        FuelType.DIESEL,
      );

      const expectedTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      processStepServiceMock.createProcessStep.mockResolvedValue(expectedTransportation);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });

      // act
      const actualResult = await service.createHydrogenTransportationProcessStep(givenPayload);

      // assert
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(
        expect.objectContaining({
          ...givenProcessStep,
          type: ProcessType.HYDROGEN_TRANSPORTATION,
          batch: expect.objectContaining({
            ...givenProcessStep.batch,
            type: BatchType.HYDROGEN,
            predecessors: [givenPredecessorBatch],
            qualityDetails: expect.objectContaining({
              distance: givenPayload.distance,
            }),
          }),
        }),
      );
      expect(actualResult).toEqual(expectedTransportation);
    });

    it('should create transportation process step with pipeline transport mode when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.PIPELINE,
        10,
        undefined,
      );

      const expectedTransportation = ProcessStepEntityFixture.createHydrogenTransportation();
      processStepServiceMock.createProcessStep.mockResolvedValue(expectedTransportation);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });

      // act
      const actualResult = await service.createHydrogenTransportationProcessStep(givenPayload);

      // assert
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(
        expect.objectContaining({
          ...givenProcessStep,
          type: ProcessType.HYDROGEN_TRANSPORTATION,
          batch: expect.objectContaining({
            ...givenProcessStep.batch,
            type: BatchType.HYDROGEN,
            predecessors: [givenPredecessorBatch],
            qualityDetails: expect.objectContaining({
              distance: givenPayload.distance,
            }),
          }),
        }),
      );
      expect(actualResult).toEqual(expectedTransportation);
    });

    it('should throw error when trailer transport mode has no distance', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.TRAILER,
        undefined,
        FuelType.DIESEL,
      );

      // act & assert
      const actualResult = service.createHydrogenTransportationProcessStep(givenPayload);

      await expect(actualResult).rejects.toThrow(`Distance is required for transport mode [${TransportType.TRAILER}].`);
      expect(processStepServiceMock.setBatchesInactive).not.toHaveBeenCalled();
      expect(processStepServiceMock.createProcessStep).not.toHaveBeenCalled();
    });

    it('should throw error when trailer transport mode has no fuel type', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.TRAILER,
        100,
        undefined,
      );

      // act & assert
      const actualResult = service.createHydrogenTransportationProcessStep(givenPayload);

      await expect(actualResult).rejects.toThrow(
        `Fuel type is required for transport mode [${TransportType.TRAILER}].`,
      );
      expect(processStepServiceMock.setBatchesInactive).not.toHaveBeenCalled();
      expect(processStepServiceMock.createProcessStep).not.toHaveBeenCalled();
    });

    it('should throw error for invalid transport mode when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        'INVALID' as TransportType,
        100,
        FuelType.DIESEL,
      );

      // act & assert
      const actualResult = service.createHydrogenTransportationProcessStep(givenPayload);

      await expect(actualResult).rejects.toThrow(`Invalid transport mode: ${givenPayload.transportMode}`);
      expect(processStepServiceMock.setBatchesInactive).not.toHaveBeenCalled();
      expect(processStepServiceMock.createProcessStep).not.toHaveBeenCalled();
    });

    it('should propagate errors from setting predecessor batches inactive and does not create the process step when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.TRAILER,
        100,
        FuelType.DIESEL,
      );
      const expectedError = new Error('failed to deactivate predecessor batch');

      processStepServiceMock.setBatchesInactive.mockRejectedValue(expectedError);

      // act & assert
      const actualResult = service.createHydrogenTransportationProcessStep(givenPayload);

      await expect(actualResult).rejects.toThrow(expectedError);
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).not.toHaveBeenCalled();
    });

    it('should propagate errors from process step creation after predecessor batches were deactivated when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorBatch = BatchEntityFixture.createHydrogenBatch();
      const givenPayload = new CreateHydrogenTransportationPayload(
        givenProcessStep,
        givenPredecessorBatch,
        TransportType.TRAILER,
        100,
        FuelType.DIESEL,
      );
      const expectedError = new Error('failed to create transportation process step');

      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockRejectedValue(expectedError);

      // act & assert
      const actualResult = service.createHydrogenTransportationProcessStep(givenPayload);

      await expect(actualResult).rejects.toThrow(expectedError);
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenPredecessorBatch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(
        expect.objectContaining({
          ...givenProcessStep,
          type: ProcessType.HYDROGEN_TRANSPORTATION,
          batch: expect.objectContaining({
            ...givenProcessStep.batch,
            type: BatchType.HYDROGEN,
            predecessors: [givenPredecessorBatch],
            qualityDetails: expect.objectContaining({
              distance: givenPayload.distance,
            }),
          }),
        }),
      );
    });
  });
});
