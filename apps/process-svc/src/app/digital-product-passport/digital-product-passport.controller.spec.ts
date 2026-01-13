/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  GeneralInformationEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ReadByIdPayload,
} from '@h2-trust/amqp';

import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { GeneralInformationService } from './general-information/general-information.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-sustainability/proof-of-sustainability.service';

describe('DigitalProductPassportController', () => {
  let controller: DigitalProductPassportController;

  type GeneralInformationServiceMock = Pick<GeneralInformationService, 'readGeneralInformation'>;
  let generalInformationService: jest.Mocked<GeneralInformationServiceMock>;

  type ProofOfOriginServiceMock = Pick<ProofOfOriginService, 'readProofOfOrigin'>;
  let proofOfOriginService: jest.Mocked<ProofOfOriginServiceMock>;

  type ProofOfSustainabilityServiceMock = Pick<ProofOfSustainabilityService, 'readProofOfSustainability'>;
  let proofOfSustainabilityService: jest.Mocked<ProofOfSustainabilityServiceMock>;

  beforeEach(async () => {
    generalInformationService = {
      readGeneralInformation: jest.fn(),
    } as jest.Mocked<GeneralInformationServiceMock>;

    proofOfOriginService = {
      readProofOfOrigin: jest.fn(),
    } as jest.Mocked<ProofOfOriginServiceMock>;

    proofOfSustainabilityService = {
      readProofOfSustainability: jest.fn(),
    } as jest.Mocked<ProofOfSustainabilityServiceMock>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalProductPassportController],
      providers: [
        DigitalProductPassportService,
        {
          provide: GeneralInformationService,
          useValue: generalInformationService,
        },
        {
          provide: ProofOfOriginService,
          useValue: proofOfOriginService,
        },
        {
          provide: ProofOfSustainabilityService,
          useValue: proofOfSustainabilityService,
        },
      ],
    }).compile();

    controller = module.get<DigitalProductPassportController>(DigitalProductPassportController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readGeneralInformation', () => {
    it('delegates to DigitalProductPassportService', async () => {
      // Arrange
      const given: ReadByIdPayload = { id: 'a' };
      const expected = new GeneralInformationEntity(
        given.id,
        new Date('2024-01-01T00:00:00Z'),
        'owner-1',
        42,
        'GREEN',
        'producer-1',
        [],
        [],
      );
      generalInformationService.readGeneralInformation.mockResolvedValue(expected);

      // Act
      const actual = await controller.readGeneralInformation(given);

      // Assert
      expect(generalInformationService.readGeneralInformation).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });

  describe('readProofOfOrigin', () => {
    it('delegates to DigitalProductPassportService', async () => {
      // Arrange
      const given: ReadByIdPayload = { id: 'a' };
      const expected: ProofOfOriginSectionEntity[] = [
        new ProofOfOriginSectionEntity('Renewable Energy'),
      ];
      proofOfOriginService.readProofOfOrigin.mockResolvedValue(expected);

      // Act
      const actual = await controller.readProofOfOrigin(given);

      // Assert
      expect(proofOfOriginService.readProofOfOrigin).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });

  describe('readProofOfSustainability', () => {
    it('delegates to DigitalProductPassportService', async () => {
      // Arrange
      const given: ReadByIdPayload = { id: 'a' };
      const expected = new ProofOfSustainabilityEntity(given.id, 12, 50, [], []);
      proofOfSustainabilityService.readProofOfSustainability.mockResolvedValue(expected);

      // Act
      const actual = await controller.readProofOfSustainability(given);

      // Assert
      expect(proofOfSustainabilityService.readProofOfSustainability).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });
});
