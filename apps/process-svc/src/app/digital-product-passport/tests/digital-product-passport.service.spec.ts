/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  DigitalProductPassportEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import {
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
} from '@h2-trust/fixtures';
import { ProcessStepService } from '../../process-step/process-step.service';
import { DigitalProductPassportService } from '../digital-product-passport.service';
import { ProofOfOriginService } from '../proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from '../proof-of-sustainability/proof-of-sustainability.service';
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
    determineTotalRedCompliance: jest.fn(),
  };

  const proofOfOriginServiceMock = {
    createProofOfOrigin: jest.fn(),
    getHydrogenBottlingCompositions: jest.fn(),
  };

  const proofOfSustainabilityServiceMock = {
    createProofOfSustainability: jest.fn(),
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
          provide: ProofOfSustainabilityService,
          useValue: proofOfSustainabilityServiceMock,
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
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();

      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [givenProductionChain],
        givenHydrogenBottling,
      );

      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);

      const proofOfOrigin: ProofOfOriginSectionEntity[] = [ProofOfOriginSectionEntityFixture.create()];
      const proofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create();

      processStepServiceMock.readProcessStep.mockReturnValue(givenProductionChain.hydrogenRootProduction);
      provenanceServiceMock.buildProvenance.mockReturnValue(Promise.resolve(givenProvenance));
      redComplianceServiceMock.determineTotalRedCompliance.mockReturnValue(givenRedCompliance);
      proofOfOriginServiceMock.createProofOfOrigin.mockReturnValue(proofOfOrigin);
      proofOfOriginServiceMock.getHydrogenBottlingCompositions.mockReturnValue([]);
      proofOfSustainabilityServiceMock.createProofOfSustainability.mockReturnValue(proofOfSustainability);
      // Act
      const actualResult: DigitalProductPassportEntity = await service.readDigitalProductPassport(
        givenHydrogenBottling.id,
      );

      // Assert
      expect(actualResult).toBeDefined();
    });
  });
});
