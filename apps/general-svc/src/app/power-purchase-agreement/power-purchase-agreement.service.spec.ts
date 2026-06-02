/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  PowerProductionUnitEntityFixture,
  PowerPurchaseAgreementEntityFixture,
  UserEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  ReadByIdPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
import {
  CreatePowerPurchaseAgreementsPayloadFixture,
  UpdatePowerPurchaseAgreementPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import { PowerPurchaseAgreementRepository, UnitRepository, UserRepository } from '@h2-trust/database';
import { PowerProductionType, PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { DomainException, ValidationException } from '@h2-trust/exceptions';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

describe('PowerPurchaseAgreementService', () => {
  let service: PowerPurchaseAgreementService;

  const powerPurchaseAgreementRepositoryMock = {
    findAllPowerPurchaseAgreements: jest.fn(),
    createPowerPurchaseAgreement: jest.fn(),
    canDecideAgreement: jest.fn(),
    updatePpaStatus: jest.fn(),
  };

  const userRepositoryMock = {
    findUser: jest.fn(),
  };

  const unitRepositoryMock = {
    ownsPowerProductionUnit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PowerPurchaseAgreementService,
        {
          provide: PowerPurchaseAgreementRepository,
          useValue: powerPurchaseAgreementRepositoryMock,
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: UnitRepository,
          useValue: unitRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PowerPurchaseAgreementService>(PowerPurchaseAgreementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should load the user and delegate with the company id when finding agreements', async () => {
      // arrange
      const givenPayload = new ReadPowerPurchaseAgreementsPayload(
        'user-1',
        PpaRequestRole.SENDER,
        PowerPurchaseAgreementStatus.APPROVED,
      );
      const givenUser = UserEntityFixture.createHydrogenUser();
      const expectedAgreements = [PowerPurchaseAgreementEntityFixture.create()];

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue(expectedAgreements);

      // act
      const actualResult = await service.findAll(givenPayload);

      // assert
      expect(userRepositoryMock.findUser).toHaveBeenCalledWith(givenPayload.userId);
      expect(powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
        givenUser.company.id,
        givenPayload.powerPurchaseAgreementStatus,
        givenPayload.powerPurchaseAgreementRole,
      );
      expect(actualResult).toEqual(expectedAgreements);
    });
  });

  describe('createPPA', () => {
    it('should throw ValidationException when validFrom is after or equal validTo', async () => {
      // arrange
      const givenPayload = CreatePowerPurchaseAgreementsPayloadFixture.create({
        validFrom: new Date('2026-12-31T00:00:00Z'),
        validTo: new Date('2026-12-31T00:00:00Z'),
      });

      // act
      const actualResult = service.createPPA(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(ValidationException);
      expect(userRepositoryMock.findUser).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement).not.toHaveBeenCalled();
    });

    it('should create a PPA for the requesting user company when the payload is valid', async () => {
      // arrange
      const givenPayload = CreatePowerPurchaseAgreementsPayloadFixture.create();
      const givenUser = UserEntityFixture.createHydrogenUser();
      const expectedAgreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement.mockResolvedValue(expectedAgreement);

      // act
      const actualResult = await service.createPPA(givenPayload);

      // assert
      expect(userRepositoryMock.findUser).toHaveBeenCalledWith(givenPayload.userId);
      expect(powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement).toHaveBeenCalledWith(
        givenPayload,
        givenUser.company.id,
      );
      expect(actualResult).toEqual(expectedAgreement);
    });
  });

  describe('updatePPA', () => {
    it('should throw DomainException when the user is not allowed to decide the agreement', async () => {
      // arrange
      const givenPayload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const givenUser = UserEntityFixture.createHydrogenUser();

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(false);

      // act
      const actualResult = service.updatePPA(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
      expect(powerPurchaseAgreementRepositoryMock.canDecideAgreement).toHaveBeenCalledWith(
        givenUser,
        givenPayload.ppaId,
      );
      expect(unitRepositoryMock.ownsPowerProductionUnit).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).not.toHaveBeenCalled();
    });

    it('should update the agreement without checking unit ownership when no production unit id is provided', async () => {
      // arrange
      const givenPayload: UpdatePowerPurchaseAgreementPayload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      givenPayload.powerProductionUnitId = undefined;
      const givenUser = UserEntityFixture.createHydrogenUser();
      const expectedAgreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      powerPurchaseAgreementRepositoryMock.updatePpaStatus.mockResolvedValue(expectedAgreement);

      // act
      const actualResult = await service.updatePPA(givenPayload);

      // assert
      expect(unitRepositoryMock.ownsPowerProductionUnit).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedAgreement);
    });

    it('should throw DomainException when the deciding user does not own the selected power production unit', async () => {
      // arrange
      const givenPayload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const givenUser = UserEntityFixture.createHydrogenUser();

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      unitRepositoryMock.ownsPowerProductionUnit.mockResolvedValue(false);

      // act
      const actualResult = service.updatePPA(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.ownsPowerProductionUnit).toHaveBeenCalledWith(
        givenUser,
        givenPayload.powerProductionUnitId,
      );
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).not.toHaveBeenCalled();
    });

    it('should update the agreement when access and ownership checks pass', async () => {
      // arrange
      const givenPayload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const givenUser = UserEntityFixture.createHydrogenUser();
      const expectedAgreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      unitRepositoryMock.ownsPowerProductionUnit.mockResolvedValue(true);
      powerPurchaseAgreementRepositoryMock.updatePpaStatus.mockResolvedValue(expectedAgreement);

      // act
      const actualResult = await service.updatePPA(givenPayload);

      // assert
      expect(powerPurchaseAgreementRepositoryMock.canDecideAgreement).toHaveBeenCalledWith(
        givenUser,
        givenPayload.ppaId,
      );
      expect(unitRepositoryMock.ownsPowerProductionUnit).toHaveBeenCalledWith(
        givenUser,
        givenPayload.powerProductionUnitId,
      );
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedAgreement);
    });
  });

  describe('findApprovedGridPowerProductionUnitByUserId', () => {
    it('should return the approved grid unit when the user has one', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('user-1');
      const givenUser = UserEntityFixture.createHydrogenUser({ id: givenPayload.id });
      const expectedGridUnit = PowerProductionUnitEntityFixture.create({
        type: PowerProductionType.GRID,
      });
      const givenAgreements = [
        PowerPurchaseAgreementEntityFixture.create(),
        PowerPurchaseAgreementEntityFixture.create({ powerProductionUnit: expectedGridUnit }),
      ];

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue(givenAgreements);

      // act
      const actualResult = await service.findApprovedGridPowerProductionUnitByUserId(givenPayload);

      // assert
      expect(powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
        givenUser.company.id,
        PowerPurchaseAgreementStatus.APPROVED,
        undefined,
      );
      expect(actualResult).toEqual(expectedGridUnit);
    });

    it('should throw DomainException when no approved grid unit exists for the user', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('user-1');
      const givenUser = UserEntityFixture.createHydrogenUser({ id: givenPayload.id });
      const givenNonGridAgreement = PowerPurchaseAgreementEntityFixture.create({
        powerProductionUnit: PowerProductionUnitEntityFixture.create({
          type: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
        }),
      });

      userRepositoryMock.findUser.mockResolvedValue(givenUser);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue([givenNonGridAgreement]);

      // act
      const actualResult = service.findApprovedGridPowerProductionUnitByUserId(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
    });
  });
});
