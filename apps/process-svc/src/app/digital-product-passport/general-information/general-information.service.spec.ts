/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { BrokerQueues, ReadByIdPayload, UserMessagePatterns } from '@h2-trust/amqp';
import {
  ProcessStepEntityFixture,
  UserEntityFixture,
  HydrogenComponentEntityFixture,
  RedComplianceEntityFixture,
  GeneralInformationEntityFixture,
} from '@h2-trust/fixtures/entities';

import { GeneralInformationService } from './general-information.service';
import { ProcessStepService } from '../../process-step/process-step.service';
import { BottlingService } from '../../process-step/bottling/bottling.service';
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

      const expectedResult = GeneralInformationEntityFixture.create({
        id: givenProcessStep.id,
        filledAt: givenProcessStep.endedAt,
        owner: givenProcessStep.batch.owner.name,
        filledAmount: givenProcessStep.batch.amount,
        color: givenProcessStep.batch.qualityDetails.color,
        producer: givenUser.company.name,
        hydrogenComposition: givenHydrogenComposition,
        redCompliance: givenRedCompliance
      });

      processStepServiceMock.readProcessStep.mockResolvedValue(givenProcessStep);
      generalSvcMock.send.mockReturnValue(of(givenUser));
      bottlingServiceMock.calculateHydrogenComposition.mockResolvedValue(givenHydrogenComposition);
      redComplianceServiceMock.determineRedCompliance.mockResolvedValue(givenRedCompliance);

      // Act
      const actualResult = await service.readGeneralInformation(givenProcessStep.id);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(generalSvcMock.send).toHaveBeenCalledWith(UserMessagePatterns.READ, new ReadByIdPayload(givenProcessStep.recordedBy.id))
      expect(bottlingServiceMock.calculateHydrogenComposition).toHaveBeenCalledWith(givenProcessStep);
      expect(redComplianceServiceMock.determineRedCompliance).toHaveBeenCalledWith(givenProcessStep.id);

      expect(actualResult).toEqual(expectedResult);
    });
  });
});
