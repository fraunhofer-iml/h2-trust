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
import { DigitalProductPassportService } from './digital-product-passport.service';
import { assembleProofOfOrigin, getHydrogenBottlingCompositions } from './proof-of-origin/proof-of-origin.assembler';
import { assembleProofOfSustainability } from './proof-of-sustainability/proof-of-sustainability.assembler';
import { buildProvenance } from './provenance/provenance.service';
import { determineRedCompliance, determineTotalRedCompliance } from './red-compliance/red-compliance';

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
    it('should return RFNBO_READY when RED compliance and sustainability requirements are fulfilled', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 85 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult = service.getRfnboType(givenProductionChain);

      // assert
      expect(determineRedComplianceMock).toHaveBeenCalledWith(
        givenProductionChain.hydrogenRootProduction,
        givenProductionChain.powerProduction,
      );
      expect(assembleProofOfSustainabilityMock).toHaveBeenCalledTimes(1);
      expect(actualResult).toBe(RfnboType.RFNBO_READY);
    });

    it('should return NON_CERTIFIABLE when power type is non-renewable', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.powerProduction.batch.qualityDetails.powerType = PowerType.NON_RENEWABLE;
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 85 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult = service.getRfnboType(givenProductionChain);

      // assert
      expect(actualResult).toBe(RfnboType.NON_CERTIFIABLE);
    });

    it('should throw when the production chain contains an invalid power type', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenProductionChain.powerProduction.batch.qualityDetails.powerType = undefined as never;

      determineRedComplianceMock.mockReturnValue(new RedComplianceEntity(true, true, true, true));

      // act & assert
      const actualOperation = () => service.getRfnboType(givenProductionChain);

      expect(actualOperation).toThrow('PowerType');
      expect(assembleProofOfSustainabilityMock).not.toHaveBeenCalled();
    });

    it('should return NON_CERTIFIABLE when emission reduction is not above 70 percent', () => {
      // arrange
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability = ProofOfSustainabilityEntityFixture.create({ emissionReductionPercentage: 70 });

      determineRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult = service.getRfnboType(givenProductionChain);

      // assert
      expect(actualResult).toBe(RfnboType.NON_CERTIFIABLE);
    });
  });

  describe('readDigitalProductPassport', () => {
    it('should return the assembled Digital Product Passport when called', async () => {
      // arrange
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProductionChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfOrigin: ProofOfOriginSectionEntity[] = [ProofOfOriginSectionEntityFixture.create()];
      const givenProofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create();
      const givenHydrogenComponents: HydrogenComponentEntity[] = [];
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
      assembleProofOfOriginMock.mockReturnValue(givenProofOfOrigin);
      getHydrogenBottlingCompositionsMock.mockReturnValue(givenHydrogenComponents);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult: DigitalProductPassportEntity = await service.readDigitalProductPassport(
        givenHydrogenBottling.id,
      );

      // assert
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
      expect(getHydrogenBottlingCompositionsMock).toHaveBeenCalledWith(givenProofOfOrigin);
      expect(assembleProofOfSustainabilityMock).toHaveBeenCalledWith(givenProvenance);
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: givenHydrogenBottling.id,
          owner: givenHydrogenBottling.batch.owner.name,
          filledAmount: givenHydrogenBottling.batch.amount,
          producer: givenHydrogenBottling.recordedBy.company.name,
          hydrogenComposition: givenHydrogenComponents,
          attachedFiles: givenHydrogenBottling.documents,
          redCompliance: givenRedCompliance,
          proofOfSustainability: givenProofOfSustainability,
          proofOfOrigin: givenProofOfOrigin,
          powerType: PowerType.RENEWABLE,
          rfnboType: RfnboType.RFNBO_READY,
        }),
      );
    });

    it('should return NON_CERTIFIABLE and NON_RENEWABLE when provenance includes non-renewable power', async () => {
      // arrange
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
      processStepServiceMock.getPredecessors.mockResolvedValue([
        givenHydrogenBottling,
        givenProductionChain.powerProduction,
      ]);
      buildProvenanceMock.mockReturnValue(givenProvenance);
      determineTotalRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfOriginMock.mockReturnValue([ProofOfOriginSectionEntityFixture.create()]);
      getHydrogenBottlingCompositionsMock.mockReturnValue([]);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult = await service.readDigitalProductPassport(givenHydrogenBottling.id);

      // assert
      expect(actualResult.powerType).toBe(PowerType.NON_RENEWABLE);
      expect(actualResult.rfnboType).toBe(RfnboType.NON_CERTIFIABLE);
    });

    it('should return PARTLY_RENEWABLE when provenance contains partly renewable but no non-renewable power', async () => {
      // arrange
      const givenHydrogenBottling: ProcessStepEntity = ProcessStepEntityFixture.createHydrogenBottling();
      const givenRenewableChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      const givenPartlyRenewableChain: ProductionChainEntity = ProductionChainEntityFixture.create();
      givenPartlyRenewableChain.powerProduction.batch.qualityDetails.powerType = PowerType.PARTLY_RENEWABLE;
      const givenRedCompliance = new RedComplianceEntity(true, true, true, true);
      const givenProofOfSustainability: ProofOfSustainabilityEntity = ProofOfSustainabilityEntityFixture.create({
        emissionReductionPercentage: 85,
      });
      const givenProvenance = new ProvenanceEntity(
        givenHydrogenBottling,
        [givenRenewableChain, givenPartlyRenewableChain],
        givenHydrogenBottling,
      );

      processStepServiceMock.readProcessStep.mockResolvedValue(givenHydrogenBottling);
      processStepServiceMock.getPredecessors.mockResolvedValue([
        givenHydrogenBottling,
        givenRenewableChain.powerProduction,
        givenPartlyRenewableChain.powerProduction,
      ]);
      buildProvenanceMock.mockReturnValue(givenProvenance);
      determineTotalRedComplianceMock.mockReturnValue(givenRedCompliance);
      assembleProofOfOriginMock.mockReturnValue([ProofOfOriginSectionEntityFixture.create()]);
      getHydrogenBottlingCompositionsMock.mockReturnValue([]);
      assembleProofOfSustainabilityMock.mockReturnValue(givenProofOfSustainability);

      // act
      const actualResult = await service.readDigitalProductPassport(givenHydrogenBottling.id);

      // assert
      expect(actualResult.powerType).toBe(PowerType.PARTLY_RENEWABLE);
      expect(actualResult.rfnboType).toBe(RfnboType.RFNBO_READY);
    });
  });
});
