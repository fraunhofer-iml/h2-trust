/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  PowerPurchaseAgreementEntityFixture,
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
  UserEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreatePowerPurchaseAgreementsPayloadFixture,
  UpdatePowerPurchaseAgreementPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import { ReadByIdPayload, ReadPowerPurchaseAgreementsPayload, UpdatePowerPurchaseAgreementPayload } from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementRepository, UnitRepository, UserRepository } from '@h2-trust/database';
import { PowerPurchaseAgreementStatus, PowerProductionType, PpaRequestRole } from '@h2-trust/domain';
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
    it('loads the user and delegates with the user company id', async () => {
      const payload = new ReadPowerPurchaseAgreementsPayload(
        'user-1',
        PpaRequestRole.SENDER,
        PowerPurchaseAgreementStatus.APPROVED,
      );
      const user = UserEntityFixture.createHydrogenUser();
      const agreements = [PowerPurchaseAgreementEntityFixture.create()];

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue(agreements);

      const actualResult = await service.findAll(payload);

      expect(userRepositoryMock.findUser).toHaveBeenCalledWith(payload.userId);
      expect(powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
        user.company.id,
        payload.powerPurchaseAgreementStatus,
        payload.powerPurchaseAgreementRole,
      );
      expect(actualResult).toEqual(agreements);
    });
  });

  describe('createPPA', () => {
    it('throws validation exception when validFrom is after or equal validTo', async () => {
      const payload = CreatePowerPurchaseAgreementsPayloadFixture.create({
        validFrom: new Date('2026-12-31T00:00:00Z'),
        validTo: new Date('2026-12-31T00:00:00Z'),
      });

      await expect(service.createPPA(payload)).rejects.toThrow(ValidationException);
      expect(userRepositoryMock.findUser).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement).not.toHaveBeenCalled();
    });

    it('creates a ppa for the company of the requesting user', async () => {
      const payload = CreatePowerPurchaseAgreementsPayloadFixture.create();
      const user = UserEntityFixture.createHydrogenUser();
      const agreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement.mockResolvedValue(agreement);

      const actualResult = await service.createPPA(payload);

      expect(userRepositoryMock.findUser).toHaveBeenCalledWith(payload.userId);
      expect(powerPurchaseAgreementRepositoryMock.createPowerPurchaseAgreement).toHaveBeenCalledWith(
        payload,
        user.company.id,
      );
      expect(actualResult).toEqual(agreement);
    });
  });

  describe('updatePPA', () => {
    it('throws when the user is not allowed to decide the agreement', async () => {
      const payload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const user = UserEntityFixture.createHydrogenUser();

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(false);

      await expect(service.updatePPA(payload)).rejects.toThrow(DomainException);
      expect(powerPurchaseAgreementRepositoryMock.canDecideAgreement).toHaveBeenCalledWith(user, payload.ppaId);
      expect(unitRepositoryMock.ownsPowerProductionUnit).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).not.toHaveBeenCalled();
    });

    it('updates the agreement without unit ownership lookup when no production unit id is provided', async () => {
      const payload: UpdatePowerPurchaseAgreementPayload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      payload.powerProductionUnitId = undefined;
      const user = UserEntityFixture.createHydrogenUser();
      const agreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      powerPurchaseAgreementRepositoryMock.updatePpaStatus.mockResolvedValue(agreement);

      const actualResult = await service.updatePPA(payload);

      expect(unitRepositoryMock.ownsPowerProductionUnit).not.toHaveBeenCalled();
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(agreement);
    });

    it('throws when the deciding user does not own the selected power production unit', async () => {
      const payload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const user = UserEntityFixture.createHydrogenUser();

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      unitRepositoryMock.ownsPowerProductionUnit.mockResolvedValue(false);

      await expect(service.updatePPA(payload)).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.ownsPowerProductionUnit).toHaveBeenCalledWith(user, payload.powerProductionUnitId);
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).not.toHaveBeenCalled();
    });

    it('updates the agreement after access and ownership checks pass', async () => {
      const payload = UpdatePowerPurchaseAgreementPayloadFixture.create();
      const user = UserEntityFixture.createHydrogenUser();
      const agreement = PowerPurchaseAgreementEntityFixture.create();

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.canDecideAgreement.mockResolvedValue(true);
      unitRepositoryMock.ownsPowerProductionUnit.mockResolvedValue(true);
      powerPurchaseAgreementRepositoryMock.updatePpaStatus.mockResolvedValue(agreement);

      const actualResult = await service.updatePPA(payload);

      expect(powerPurchaseAgreementRepositoryMock.canDecideAgreement).toHaveBeenCalledWith(user, payload.ppaId);
      expect(unitRepositoryMock.ownsPowerProductionUnit).toHaveBeenCalledWith(user, payload.powerProductionUnitId);
      expect(powerPurchaseAgreementRepositoryMock.updatePpaStatus).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(agreement);
    });
  });

  describe('findApprovedGridPowerProductionUnitByUserId', () => {
    it('returns the approved grid unit for the user', async () => {
      const payload = new ReadByIdPayload('user-1');
      const user = UserEntityFixture.createHydrogenUser({ id: payload.id });
      const gridUnit = PowerProductionUnitEntityFixture.create({
        type: PowerProductionTypeEntityFixture.createGrid(),
      });
      const agreements = [
        PowerPurchaseAgreementEntityFixture.create(),
        PowerPurchaseAgreementEntityFixture.create({ powerProductionUnit: gridUnit }),
      ];

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue(agreements);

      const actualResult = await service.findApprovedGridPowerProductionUnitByUserId(payload);

      expect(powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
        user.company.id,
        PowerPurchaseAgreementStatus.APPROVED,
        undefined,
      );
      expect(actualResult).toEqual(gridUnit);
    });

    it('throws when no approved grid unit exists for the user', async () => {
      const payload = new ReadByIdPayload('user-1');
      const user = UserEntityFixture.createHydrogenUser({ id: payload.id });
      const nonGridAgreement = PowerPurchaseAgreementEntityFixture.create({
        powerProductionUnit: PowerProductionUnitEntityFixture.create({
          type: PowerProductionTypeEntityFixture.createSolarEnergy({ name: PowerProductionType.PHOTOVOLTAIC_SYSTEM }),
        }),
      });

      userRepositoryMock.findUser.mockResolvedValue(user);
      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue([nonGridAgreement]);

      await expect(service.findApprovedGridPowerProductionUnitByUserId(payload)).rejects.toThrow(DomainException);
    });
  });
});