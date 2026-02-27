/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from '../process-step/process-step.service';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

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

  const hydrogenProductionSectionServiceMock = {
    buildSection: jest.fn(),
  };

  const provenanceServiceMock = {
    buildProvenance: jest.fn(),
  };

  const emissionServiceMock = {
    computeProvenanceEmissions: jest.fn(),
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
          provide: HydrogenProductionSectionService,
          useValue: hydrogenProductionSectionServiceMock,
        },
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

    service = module.get<DigitalProductPassportService>(DigitalProductPassportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateHydrogenComposition', () => {
    it(`returns composition for ${ProcessType.HYDROGEN_BOTTLING} process step`, async () => {
      // Arrange
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
      });

      // Act
      const actualResult = await service.calculateHydrogenComposition(givenProcessStep);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });

    it(`reads predecessor for ${ProcessType.HYDROGEN_TRANSPORTATION} process step`, async () => {
      // Arrange
      const givenBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenBottlingProcessStep.id,
            }),
          ],
        }),
      });

      processStepServiceMock.readProcessStep.mockResolvedValue(givenBottlingProcessStep);

      // Act
      const actualResult = await service.calculateHydrogenComposition(givenTransportationProcessStep);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenBottlingProcessStep.id);
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });

    it('throws error when transportation has no predecessor', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [],
        }),
      });

      const expectedErrorMessage = `Process step ${givenProcessStep.id} has no predecessor to derive composition from`;

      // Act & Assert
      await expect(service.calculateHydrogenComposition(givenProcessStep)).rejects.toThrow(expectedErrorMessage);
    });

    it(`throws error when predecessor is not ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
      // Arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenPredecessorProcessStep.id,
            }),
          ],
        }),
      });

      processStepServiceMock.readProcessStep.mockResolvedValue(givenPredecessorProcessStep);

      const expectedErrorMessage = `Predecessor process step ${givenPredecessorProcessStep.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`;

      // Act & Assert
      await expect(service.calculateHydrogenComposition(givenTransportationProcessStep)).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });
});
