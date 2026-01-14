/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceEntity } from '@h2-trust/amqp';
import { ProcessStepEntityFixture, ProofOfSustainabilityEntityFixture } from '@h2-trust/fixtures/entities';
import { ProofOfSustainabilityService } from './proof-of-sustainability.service';
import { ProvenanceService } from '../provenance/provenance.service';
import { EmissionService } from '../proof-of-origin/emission.service';

describe('ProofOfSustainabilityService', () => {
  let service: ProofOfSustainabilityService;

  const provenanceServiceMock = {
    buildProvenance: jest.fn(),
  };

  const emissionServiceMock = {
    computeProvenanceEmissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProofOfSustainabilityService,
        {
          provide: ProvenanceService,
          useValue: provenanceServiceMock,
        },
        {
          provide: EmissionService,
          useValue: emissionServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProofOfSustainabilityService>(ProofOfSustainabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readProofOfSustainability', () => {
    it('returns ProofOfSustainabilityEntity with emission data from provenance', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenProvenance = new ProvenanceEntity(
        ProcessStepEntityFixture.createHydrogenProduction(),
        undefined,
        [ProcessStepEntityFixture.createHydrogenProduction()],
        [],
        [ProcessStepEntityFixture.createPowerProduction()],
      );
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create();

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      emissionServiceMock.computeProvenanceEmissions.mockResolvedValue(givenProofOfSustainability);

      // Act
      const actualResult = await service.readProofOfSustainability(givenProcessStepId);

      // Assert
      expect(provenanceServiceMock.buildProvenance).toHaveBeenCalledWith(givenProcessStepId);
      expect(emissionServiceMock.computeProvenanceEmissions).toHaveBeenCalledWith(givenProvenance);
      
      expect(actualResult.batchId).toEqual(givenProofOfSustainability.batchId);
      expect(actualResult.amountCO2PerMJH2).toEqual(givenProofOfSustainability.amountCO2PerMJH2);
      expect(actualResult.emissionReductionPercentage).toEqual(givenProofOfSustainability.emissionReductionPercentage);
      expect(actualResult.calculations).toEqual(givenProofOfSustainability.calculations);
      expect(actualResult.emissions).toEqual(givenProofOfSustainability.emissions);
    });
  });
});
