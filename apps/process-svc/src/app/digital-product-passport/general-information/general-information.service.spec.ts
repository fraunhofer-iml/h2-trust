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

  type ProcessStepServiceMock = Pick<ProcessStepService, 'readProcessStep'>;
  let processStepService: jest.Mocked<ProcessStepServiceMock>;

  type BottlingServiceMock = Pick<BottlingService, 'calculateHydrogenComposition'>;
  let bottlingService: jest.Mocked<BottlingServiceMock>;

  type RedComplianceServiceMock = Pick<RedComplianceService, 'determineRedCompliance'>;
  let redComplianceService: jest.Mocked<RedComplianceServiceMock>;

  const generalSvcMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    processStepService = {
      readProcessStep: jest.fn(),
    } as jest.Mocked<ProcessStepServiceMock>;

    bottlingService = {
      calculateHydrogenComposition: jest.fn(),
    } as jest.Mocked<BottlingServiceMock>;

    redComplianceService = {
      determineRedCompliance: jest.fn(),
    } as jest.Mocked<RedComplianceServiceMock>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralInformationService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: ProcessStepService,
          useValue: processStepService,
        },
        {
          provide: BottlingService,
          useValue: bottlingService,
        },
        {
          provide: RedComplianceService,
          useValue: redComplianceService,
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
      const givenProcessStep = ProcessStepEntityFixture.create();
      const givenUser = UserEntityFixture.create();
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.create()];
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

      processStepService.readProcessStep.mockResolvedValue(givenProcessStep);
      generalSvcMock.send.mockReturnValue(of(givenUser));
      bottlingService.calculateHydrogenComposition.mockResolvedValue(givenHydrogenComposition);
      redComplianceService.determineRedCompliance.mockResolvedValue(givenRedCompliance);

      // Act
      const actualResult = await service.readGeneralInformation(givenProcessStep.id);

      // Assert
      expect(processStepService.readProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(generalSvcMock.send).toHaveBeenCalledWith(UserMessagePatterns.READ, new ReadByIdPayload(givenProcessStep.recordedBy.id))
      expect(bottlingService.calculateHydrogenComposition).toHaveBeenCalledWith(givenProcessStep);
      expect(redComplianceService.determineRedCompliance).toHaveBeenCalledWith(givenProcessStep.id);

      expect(actualResult).toEqual(expectedResult);
    });
  });
});
