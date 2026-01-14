/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, ReadByIdPayload, UserMessagePatterns } from '@h2-trust/amqp';
import {
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  RedComplianceEntityFixture,
  UserEntityFixture,
} from '@h2-trust/fixtures/entities';
import { BottlingService } from '../../process-step/bottling/bottling.service';
import { ProcessStepService } from '../../process-step/process-step.service';
import { GeneralInformationService } from './general-information.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

describe('GeneralInformationService', () => {
  let service: GeneralInformationService;

  const processStepServiceMock = {
    readProcessStep: jest.fn(),
  };

  const bottlingServiceMock = {
    calculateHydrogenComposition: jest.fn(),
  };

  const redComplianceServiceMock = {
    determineRedCompliance: jest.fn(),
  };

  const generalSvcMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralInformationService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
        {
          provide: BottlingService,
          useValue: bottlingServiceMock,
        },
        {
          provide: RedComplianceService,
          useValue: redComplianceServiceMock,
        },
      ],
    }).compile();

    service = module.get<GeneralInformationService>(GeneralInformationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readGeneralInformation', () => {
    it('returns GeneralInformationEntity with data from all services', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      const givenUser = UserEntityFixture.create();
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen()];
      const givenRedCompliance = RedComplianceEntityFixture.create();

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      generalSvcMock.send.mockReturnValue(of(givenUser));
      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenComposition);
      redComplianceServiceMock.determineRedCompliance.mockResolvedValue(givenRedCompliance);

      // Act
      const actualResult = await service.readGeneralInformation(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(generalSvcMock.send).toHaveBeenCalledWith(
        UserMessagePatterns.READ,
        new ReadByIdPayload(givenProcessStep.recordedBy.id),
      );
      expect(bottlingServiceMock.calculateHydrogenComposition).toHaveBeenCalledWith(givenProcessStep);
      expect(redComplianceServiceMock.determineRedCompliance).toHaveBeenCalledWith(givenProcessStep.id);

      expect(actualResult.id).toEqual(givenProcessStep.id);
      expect(actualResult.filledAt).toEqual(givenProcessStep.endedAt);
      expect(actualResult.owner).toEqual(givenProcessStep.batch.owner.name);
      expect(actualResult.filledAmount).toEqual(givenProcessStep.batch.amount);
      expect(actualResult.color).toEqual(givenProcessStep.batch.qualityDetails.color);
      expect(actualResult.producer).toEqual(givenUser.company.name);
      expect(actualResult.hydrogenComposition).toHaveLength(1);
      expect(actualResult.hydrogenComposition[0].amount).toEqual(givenHydrogenComposition[0].amount);
      expect(actualResult.hydrogenComposition[0].color).toEqual(givenHydrogenComposition[0].color);
      expect(actualResult.redCompliance).toBeDefined();
      expect(actualResult.redCompliance.financialSupportReceived).toEqual(givenRedCompliance.financialSupportReceived);
      expect(actualResult.redCompliance.isAdditionalityFulfilled).toEqual(givenRedCompliance.isAdditionalityFulfilled);
      expect(actualResult.redCompliance.isGeoCorrelationValid).toEqual(givenRedCompliance.isAdditionalityFulfilled);
      expect(actualResult.redCompliance.isTimeCorrelationValid).toEqual(givenRedCompliance.isTimeCorrelationValid);
      expect(actualResult.redCompliance.isRedCompliant).toEqual(givenRedCompliance.isRedCompliant);
    });
  });
});
