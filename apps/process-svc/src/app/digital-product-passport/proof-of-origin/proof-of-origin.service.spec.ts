/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceEntity } from '@h2-trust/amqp';
import { ProcessStepEntityFixture, ProofOfOriginSectionEntityFixture } from '@h2-trust/fixtures/entities';
import { ProvenanceService } from '../provenance/provenance.service';
import { HydrogenBottlingSectionService } from './hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './hydrogen-transportation-section.service';
import { ProofOfOriginService } from './proof-of-origin.service';

describe('ProofOfOriginService', () => {
  let service: ProofOfOriginService;

  const hydrogenProductionSectionServiceMock = {
    buildSection: jest.fn(),
  };

  const hydrogenStorageSectionServiceMock = {
    buildSection: jest.fn(),
  };

  const hydrogenBottlingSectionServiceMock = {
    buildSection: jest.fn(),
  };

  const hydrogenTransportationSectionServiceMock = {
    buildSection: jest.fn(),
  };

  const provenanceServiceMock = {
    buildProvenance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProofOfOriginService,
        {
          provide: HydrogenProductionSectionService,
          useValue: hydrogenProductionSectionServiceMock,
        },
        {
          provide: HydrogenStorageSectionService,
          useValue: hydrogenStorageSectionServiceMock,
        },
        {
          provide: HydrogenBottlingSectionService,
          useValue: hydrogenBottlingSectionServiceMock,
        },
        {
          provide: HydrogenTransportationSectionService,
          useValue: hydrogenTransportationSectionServiceMock,
        },
        {
          provide: ProvenanceService,
          useValue: provenanceServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProofOfOriginService>(ProofOfOriginService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readProofOfOrigin', () => {
    it('returns ProofOfOriginSectionEntities for each provenance segment', async () => {
      // Arrange
      const givenProcessStepId = 'process-step-1';
      const givenRootProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenProductions = [ProcessStepEntityFixture.createHydrogenProduction()];
      const givenWaterConsumptions = [ProcessStepEntityFixture.createWaterConsumption()];
      const givenPowerProductions = [ProcessStepEntityFixture.createPowerProduction()];

      const givenProvenance = new ProvenanceEntity(
        givenRootProcessStep,
        givenHydrogenBottling,
        givenHydrogenProductions,
        givenWaterConsumptions,
        givenPowerProductions,
      );

      const hydrogenProductionSection = ProofOfOriginSectionEntityFixture.create({ name: 'Hydrogen Production' });
      const hydrogenStorageSection = ProofOfOriginSectionEntityFixture.create({ name: 'Hydrogen Storage' });
      const hydrogenBottlingSection = ProofOfOriginSectionEntityFixture.create({ name: 'Hydrogen Bottling' });
      const hydrogenTransportationSection = ProofOfOriginSectionEntityFixture.create({
        name: 'Hydrogen Transportation',
      });

      provenanceServiceMock.buildProvenance.mockResolvedValue(givenProvenance);
      hydrogenProductionSectionServiceMock.buildSection.mockResolvedValue(hydrogenProductionSection);
      hydrogenStorageSectionServiceMock.buildSection.mockResolvedValue(hydrogenStorageSection);
      hydrogenBottlingSectionServiceMock.buildSection.mockResolvedValue(hydrogenBottlingSection);
      hydrogenTransportationSectionServiceMock.buildSection.mockResolvedValue(hydrogenTransportationSection);

      // Act
      const actualResult = await service.readProofOfOrigin(givenProcessStepId);

      // Assert
      expect(provenanceServiceMock.buildProvenance).toHaveBeenCalledWith(givenProcessStepId);
      expect(hydrogenProductionSectionServiceMock.buildSection).toHaveBeenCalledWith(
        givenPowerProductions,
        givenWaterConsumptions,
        givenHydrogenBottling.batch.amount,
      );
      expect(hydrogenStorageSectionServiceMock.buildSection).toHaveBeenCalledWith(givenHydrogenProductions);
      expect(hydrogenBottlingSectionServiceMock.buildSection).toHaveBeenCalledWith(givenHydrogenBottling);
      expect(hydrogenTransportationSectionServiceMock.buildSection).toHaveBeenCalledWith(
        givenRootProcessStep,
        givenHydrogenBottling,
      );

      expect(actualResult).toEqual([
        hydrogenProductionSection,
        hydrogenStorageSection,
        hydrogenBottlingSection,
        hydrogenTransportationSection,
      ]);
    });
  });
});
