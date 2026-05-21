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
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/contracts/entities';
import {
  ProcessStepEntityFixture,
  ProductionChainEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
import { assembleProofOfOrigin, getHydrogenBottlingCompositions } from './proof-of-origin/proof-of-origin.assembler';
import { assembleProofOfSustainability } from './proof-of-sustainability/proof-of-sustainability.assembler';
import { buildProvenance } from './provenance/provenance.service';
import { determineRedCompliance, determineTotalRedCompliance } from './red-compliance/red-compliance';
import { DigitalProductPassportService } from './digital-product-passport.service';

jest.mock('./proof-of-origin/proof-of-origin.assembler', () => ({
  assembleProofOfOrigin: jest.fn(),
  getHydrogenBottlingCompositions: jest.fn(),
}));

jest.mock('./proof-of-sustainability/proof-of-sustainability.assembler', () => ({
  assembleProofOfSustainability: jest.fn(),
}));

jest.mock('./provenance/provenance.service', () => ({
  buildProvenance: jest.fn(),
}));

jest.mock('./red-compliance/red-compliance', () => ({
  determineRedCompliance: jest.fn(),
  determineTotalRedCompliance: jest.fn(),
}));

describe('DigitalProductPassportService', () => {
  let service: DigitalProductPassportService;

  const determineRedComplianceMock = jest.mocked(determineRedCompliance);
  const determineTotalRedComplianceMock = jest.mocked(determineTotalRedCompliance);
  const assembleProofOfOriginMock = jest.mocked(assembleProofOfOrigin);
  const getHydrogenBottlingCompositionsMock = jest.mocked(getHydrogenBottlingCompositions);
  const assembleProofOfSustainabilityMock = jest.mocked(assembleProofOfSustainability);
  const buildProvenanceMock = jest.mocked(buildProvenance);

  const processStepServiceMock = {
    readProcessStep: jest.fn(),
    getPredecessors: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalProductPassportService,
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
      ],
    }).compile();

    service = module.get<DigitalProductPassportService>(DigitalProductPassportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRfnboType', () => {
    it('returns RFNBO_READY when RED compliance and sustainability requirements are fulfilled', () => {
      // Arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 85 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // Act
      const actualResult = service.getRfnboType(givenProductionChain);

      // Assert
      expect(determineRedComplianceMock).toHaveBeenCalledWith(
        givenProductionChain.hydrogenRootProduction,
        givenProductionChain.powerProduction,
      );
      expect(assembleProofOfSustainabilityMock).toHaveBeenCalledTimes(1);
      expect(actualResult).toBe(RfnboType.RFNBO_READY);
    });

    it('returns NON_CERTIFIABLE when power type is non-renewable', () => {
      // Arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.powerProduction.batch.qualityDetails.powerType = PowerType.NON_RENEWABLE;
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 85 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // Act
      const actualResult = service.getRfnboType(givenProductionChain);

      // Assert
      expect(actualResult).toBe(RfnboType.NON_CERTIFIABLE);
    });

    it('throws when the production chain contains an invalid power type', () => {
      // Arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.powerProduction.batch.qualityDetails.powerType = undefined as never;

      determineRedComplianceMock.mockReturnValue(new RedComplianceEntity(true, true, true, true));

      // Act & Assert
      expect(() => service.getRfnboType(givenProductionChain)).toThrow('PowerType');
      expect(assembleProofOfSustainabilityMock).not.toHaveBeenCalled();
    });

    it('returns NON_CERTIFIABLE when emission reduction is not above 70 percent', () => {
      // Arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 70 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // Act
      const actualResult = service.getRfnboType(givenProductionChain);

      // Assert
      expect(actualResult).toBe(RfnboType.NON_CERTIFIABLE);
    });
  });

  describe('readDigitalProductPassport', () => {
    it('returns the assembled Digital Product Passport', async () => {
      // Arrange
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const proofOfOrigin: ProofOfOriginSectionEntity[] = [ProofOfOriginSectionEntityFixture.create()];
      const proofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create();
      const hydrogenComponents: HydrogenComponentEntity[] = [];
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [givenProductionChain],
        givenHydrogenBottling,
      );

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenBottling);
      processStepServiceMock.getPredecessors.mockResolvedValue([
        givenHydrogenBottling,
        givenProductionChain.hydrogenRootProduction,
        givenProductionChain.powerProduction,
        givenProductionChain.waterConsumption,
      ]);

      buildProvenanceMock.mockReturnValue(givenProvenance);
      determineTotalRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfOriginMock.mockReturnValue(proofOfOrigin);
      getHydrogenBottlingCompositionsMock.mockReturnValue(hydrogenComponents);
      assembleProofOfSustainabilityMock.mockReturnValue(proofOfSustainability);

      // Act
      const actualResult: DigitalProductPassportEntity = await service.readDigitalProductPassport(
        givenHydrogenBottling.id,
      );

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenHydrogenBottling.id);
      expect(processStepServiceMock.getPredecessors).toHaveBeenCalledWith(givenHydrogenBottling);
      expect(buildProvenanceMock).toHaveBeenCalledWith(givenHydrogenBottling, [
        givenHydrogenBottling,
        givenProductionChain.hydrogenRootProduction,
        givenProductionChain.powerProduction,
        givenProductionChain.waterConsumption,
      ]);
      expect(determineTotalRedComplianceMock).toHaveBeenCalledWith(givenProvenance.productionChains);
      expect(assembleProofOfOriginMock).toHaveBeenCalledWith(givenProvenance);
      expect(getHydrogenBottlingCompositionsMock).toHaveBeenCalledWith(proofOfOrigin);
      expect(assembleProofOfSustainabilityMock).toHaveBeenCalledWith(givenProvenance);
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: givenHydrogenBottling.id,
          owner: givenHydrogenBottling.batch.owner.name,
          filledAmount: givenHydrogenBottling.batch.amount,
          producer: givenHydrogenBottling.recordedBy.company.name,
          hydrogenComposition: hydrogenComponents,
          attachedFiles: givenHydrogenBottling.documents,
          redCompliance: givenRedCompliance,
          proofOfSustainability,
          proofOfOrigin,
          powerType: PowerType.RENEWABLE,
          rfnboType: RfnboType.RFNBO_READY,
        }),
      );
    });

    it('returns NON_CERTIFIABLE and NON_RENEWABLE when provenance includes non-renewable power', async () => {
      // Arrange
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.powerProduction.batch.qualityDetails.powerType = PowerType.NON_RENEWABLE;
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create({
        emissionReductionPercentage: 85,
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [givenProductionChain],
        givenHydrogenBottling,
      );

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenBottling);
      processStepServiceMock.getPredecessors.mockResolvedValue([givenHydrogenBottling, givenProductionChain.powerProduction]);
      buildProvenanceMock.mockReturnValue(givenProvenance);
      determineTotalRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfOriginMock.mockReturnValue([ProofOfOriginSectionEntityFixture.create()]);
      getHydrogenBottlingCompositionsMock.mockReturnValue([]);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // Act
      const actualResult = await service.readDigitalProductPassport(givenHydrogenBottling.id);

      // Assert
      expect(actualResult.powerType).toBe(PowerType.NON_RENEWABLE);
      expect(actualResult.rfnboType).toBe(RfnboType.NON_CERTIFIABLE);
    });

    it('returns PARTLY_RENEWABLE when provenance contains partly renewable but no non-renewable power', async () => {
      // Arrange
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const renewableChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const partlyRenewableChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      partlyRenewableChain.powerProduction.batch.qualityDetails.powerType = PowerType.PARTLY_RENEWABLE;
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create({
        emissionReductionPercentage: 85,
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [renewableChain, partlyRenewableChain],
        givenHydrogenBottling,
      );

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenBottling);
      processStepServiceMock.getPredecessors.mockResolvedValue([
        givenHydrogenBottling,
        renewableChain.powerProduction,
        partlyRenewableChain.powerProduction,
      ]);
      buildProvenanceMock.mockReturnValue(givenProvenance);
      determineTotalRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfOriginMock.mockReturnValue([ProofOfOriginSectionEntityFixture.create()]);
      getHydrogenBottlingCompositionsMock.mockReturnValue([]);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // Act
      const actualResult = await service.readDigitalProductPassport(givenHydrogenBottling.id);

      // Assert
      expect(actualResult.powerType).toBe(PowerType.PARTLY_RENEWABLE);
      expect(actualResult.rfnboType).toBe(RfnboType.RFNBO_READY);
    });
  });
});
