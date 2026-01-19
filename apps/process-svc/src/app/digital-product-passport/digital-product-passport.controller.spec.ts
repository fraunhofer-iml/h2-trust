/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ReadByIdPayload } from '@h2-trust/amqp';
import {
  GeneralInformationEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
} from '@h2-trust/fixtures/entities';
import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { GeneralInformationService } from './general-information/general-information.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-sustainability/proof-of-sustainability.service';

describe('DigitalProductPassportController', () => {
  let controller: DigitalProductPassportController;

  const generalInformationServiceMock = {
    readGeneralInformation: jest.fn(),
  };

  const proofOfOriginServiceMock = {
    readProofOfOrigin: jest.fn(),
  };

  const proofOfSustainabilityServiceMock = {
    readProofOfSustainability: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalProductPassportController],
      providers: [
        DigitalProductPassportService,
        {
          provide: GeneralInformationService,
          useValue: generalInformationServiceMock,
        },
        {
          provide: ProofOfOriginService,
          useValue: proofOfOriginServiceMock,
        },
        {
          provide: ProofOfSustainabilityService,
          useValue: proofOfSustainabilityServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DigitalProductPassportController>(DigitalProductPassportController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readGeneralInformation', () => {
    it('delegates to GeneralInformationService', async () => {
      // Arrange
      const expected = GeneralInformationEntityFixture.create();
      const given = new ReadByIdPayload(expected.id);

      generalInformationServiceMock.readGeneralInformation.mockResolvedValue(expected);

      // Act
      const actual = await controller.readGeneralInformation(given);

      // Assert
      expect(generalInformationServiceMock.readGeneralInformation).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });

  describe('readProofOfOrigin', () => {
    it('delegates to ProofOfOriginService', async () => {
      // Arrange
      const expected = [ProofOfOriginSectionEntityFixture.create()];
      const given = new ReadByIdPayload('a');

      proofOfOriginServiceMock.readProofOfOrigin.mockResolvedValue(expected);

      // Act
      const actual = await controller.readProofOfOrigin(given);

      // Assert
      expect(proofOfOriginServiceMock.readProofOfOrigin).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });

  describe('readProofOfSustainability', () => {
    it('delegates to ProofOfSustainabilityService', async () => {
      // Arrange
      const expected = ProofOfSustainabilityEntityFixture.create();
      const given = new ReadByIdPayload(expected.batchId);

      proofOfSustainabilityServiceMock.readProofOfSustainability.mockResolvedValue(expected);

      // Act
      const actual = await controller.readProofOfSustainability(given);

      // Assert
      expect(proofOfSustainabilityServiceMock.readProofOfSustainability).toHaveBeenCalledWith(given.id);
      expect(actual).toEqual(expected);
    });
  });
});
