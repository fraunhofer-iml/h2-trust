/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DigitalProductPassportEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from '../../process-step/process-step.service';
import { DigitalProductPassportService } from '../digital-product-passport.service';
import { ProofOfOriginService } from '../proof-of-origin.service';
import { ProvenanceService } from '../provenance/provenance.service';
import { RedComplianceService } from '../red-compliance/red-compliance.service';

describe('DigitalProductPassService', () => {
  let service: DigitalProductPassportService;

  const processStepServiceMock = {
    readAllProcessStepsFromStorageUnit: jest.fn(),
    setBatchesInactive: jest.fn(),
    createProcessStep: jest.fn(),
    readProcessStep: jest.fn(),
  };

  const redComplianceServiceMock = {
    determineRedCompliance: jest.fn(),
  };

  const proofOfOriginServiceMock = {
    buildSection: jest.fn(),
  };

  const provenanceServiceMock = {
    buildProvenance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalProductPassportService,
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
        {
          provide: RedComplianceService,
          useValue: redComplianceServiceMock,
        },
        {
          provide: ProofOfOriginService,
          useValue: proofOfOriginServiceMock,
        },
        {
          provide: ProvenanceService,
          useValue: provenanceServiceMock,
        },
      ],
    }).compile();

    service = module.get<DigitalProductPassportService>(DigitalProductPassportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readDigitalProductPassport', () => {
    it(`returns the DigitalProductPassport`, async () => {
      // Arrange
      /*
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });*/

      const hydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();

      // Act
      const actualResult: DigitalProductPassportEntity = await service.readDigitalProductPassport(hydrogenBottling.id);

      // Assert
      expect(actualResult).toBeDefined();
    });
  });
});
