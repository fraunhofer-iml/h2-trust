/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { ReadByIdPayload, ReadByIdsPayload } from '@h2-trust/contracts/payloads';
import {
  CreateHydrogenProductionUnitPayloadFixture,
  CreateHydrogenStorageUnitPayloadFixture,
  CreatePowerProductionUnitPayloadFixture,
  UpdateUnitStatusPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import { UnitRepository } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { DomainException } from '@h2-trust/exceptions';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;

  const unitRepositoryMock = {
    findUnitById: jest.fn(),
    findUnitsByIds: jest.fn(),
    findUnitsByOwnerIdAndType: jest.fn(),
    updateOrCreateHydrogenProductionUnit: jest.fn(),
    updateOrCreatePowerProductionUnit: jest.fn(),
    updateOrCreateHydrogenStorageUnit: jest.fn(),
    updateUnitStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: UnitRepository,
          useValue: unitRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UnitService>(UnitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('read methods', () => {
    it('should delegate readUnitById to UnitRepository when reading a unit by id', async () => {
      // arrange
      const expectedUnit = PowerProductionUnitEntityFixture.create();
      unitRepositoryMock.findUnitById.mockResolvedValue(expectedUnit);

      // act
      const actualResult = await service.readUnitById(expectedUnit.id);

      // assert
      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(expectedUnit.id);
      expect(actualResult).toEqual(expectedUnit);
    });

    it('should delegate readUnitsByIds to UnitRepository when reading units by ids', async () => {
      // arrange
      const givenPayload = new ReadByIdsPayload(['unit-1', 'unit-2']);
      const expectedUnits = [PowerProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findUnitsByIds.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByIds(givenPayload.ids);

      // assert
      expect(unitRepositoryMock.findUnitsByIds).toHaveBeenCalledWith(givenPayload.ids);
      expect(actualResult).toEqual(expectedUnits);
    });

    it('should delegate readPowerProductionUnitsByOwnerId to UnitRepository when reading power units by owner', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('company-1');
      const expectedUnits = [PowerProductionUnitEntityFixture.create()];
      unitRepositoryMock.findUnitsByOwnerIdAndType.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByOwnerIdAndType(givenPayload.id, UnitType.POWER_PRODUCTION);

      // assert
      expect(unitRepositoryMock.findUnitsByOwnerIdAndType).toHaveBeenCalledWith(
        givenPayload.id,
        UnitType.POWER_PRODUCTION,
      );
      expect(actualResult).toEqual(expectedUnits);
    });

    it('should delegate readPowerProductionUnitsByIds to UnitRepository when reading power units by ids', async () => {
      // arrange
      const givenPayload = new ReadByIdsPayload(['unit-1']);
      const expectedUnits = [PowerProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findUnitsByIds.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByIds(givenPayload.ids);

      // assert
      expect(unitRepositoryMock.findUnitsByIds).toHaveBeenCalledWith(givenPayload.ids);
      expect(actualResult).toEqual(expectedUnits);
    });

    it('should delegate readHydrogenProductionUnitsByOwnerId to UnitRepository when reading hydrogen units by owner', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('company-1');
      const expectedUnits = [HydrogenProductionUnitEntityFixture.create()];
      unitRepositoryMock.findUnitsByOwnerIdAndType.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByOwnerIdAndType(givenPayload.id, UnitType.HYDROGEN_PRODUCTION);

      // assert
      expect(unitRepositoryMock.findUnitsByOwnerIdAndType).toHaveBeenCalledWith(
        givenPayload.id,
        UnitType.HYDROGEN_PRODUCTION,
      );
      expect(actualResult).toEqual(expectedUnits);
    });

    it('should delegate readHydrogenProductionUnitsByIds to UnitRepository when reading hydrogen units by ids', async () => {
      // arrange
      const givenPayload = new ReadByIdsPayload(['unit-1']);
      const expectedUnits = [HydrogenProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findUnitsByIds.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByIds(givenPayload.ids);

      // assert
      expect(unitRepositoryMock.findUnitsByIds).toHaveBeenCalledWith(givenPayload.ids);
      expect(actualResult).toEqual(expectedUnits);
    });

    it('should delegate readHydrogenStorageUnitsByOwnerId to UnitRepository when reading hydrogen storage units by owner', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('company-1');
      const expectedUnits = [HydrogenStorageUnitEntityFixture.create()];
      unitRepositoryMock.findUnitsByOwnerIdAndType.mockResolvedValue(expectedUnits);

      // act
      const actualResult = await service.readUnitsByOwnerIdAndType(givenPayload.id, UnitType.HYDROGEN_STORAGE);

      // assert
      expect(unitRepositoryMock.findUnitsByOwnerIdAndType).toHaveBeenCalledWith(
        givenPayload.id,
        UnitType.HYDROGEN_STORAGE,
      );
      expect(actualResult).toEqual(expectedUnits);
    });
  });

  describe('updateOrCreateHydrogenProductionUnit', () => {
    it('should delegate directly when the payload has no id', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionUnitPayloadFixture.create({ id: undefined });
      const expectedUnit = HydrogenProductionUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreateHydrogenProductionUnit.mockResolvedValue(expectedUnit);

      // act
      const actualResult = await service.updateOrCreateHydrogenProductionUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUnit);
    });

    it('should check ownership before updating an existing unit when the payload contains an id', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = 'company-1';
      const givenExistingUnit = HydrogenProductionUnitEntityFixture.create({
        id: givenPayload.id,
      });
      const expectedUpdatedUnit = HydrogenProductionUnitEntityFixture.create({ id: givenPayload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);
      unitRepositoryMock.updateOrCreateHydrogenProductionUnit.mockResolvedValue(expectedUpdatedUnit);

      // act
      const actualResult = await service.updateOrCreateHydrogenProductionUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(givenPayload.id);
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUpdatedUnit);
    });

    it('should throw DomainException when the requester company does not own the existing unit', async () => {
      // arrange
      const givenPayload = CreateHydrogenProductionUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = 'company-2';
      const givenExistingUnit = HydrogenProductionUnitEntityFixture.create({
        id: givenPayload.id,
      });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);

      // act
      const actualResult = service.updateOrCreateHydrogenProductionUnit(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateOrCreatePowerProductionUnit', () => {
    it('should delegate directly when the payload has no id', async () => {
      // arrange
      const givenPayload = CreatePowerProductionUnitPayloadFixture.create({ id: undefined });
      const expectedUnit = PowerProductionUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreatePowerProductionUnit.mockResolvedValue(expectedUnit);

      // act
      const actualResult = await service.updateOrCreatePowerProductionUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUnit);
    });

    it('should check ownership before updating an existing unit when the payload contains an id', async () => {
      // arrange
      const givenPayload = CreatePowerProductionUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = 'company-1';
      const givenExistingUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.id,
      });
      const expectedUpdatedUnit = PowerProductionUnitEntityFixture.create({ id: givenPayload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);
      unitRepositoryMock.updateOrCreatePowerProductionUnit.mockResolvedValue(expectedUpdatedUnit);

      // act
      const actualResult = await service.updateOrCreatePowerProductionUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(givenPayload.id);
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUpdatedUnit);
    });

    it('should throw an error when requesterCompanyId is missing for an update', async () => {
      // arrange
      const givenPayload = CreatePowerProductionUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = undefined;

      // act
      const actualResult = service.updateOrCreatePowerProductionUnit(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow('requesterCompanyId');
      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateOrCreateHydrogenStorageUnit', () => {
    it('should delegate directly when the payload has no id', async () => {
      // arrange
      const givenPayload = CreateHydrogenStorageUnitPayloadFixture.create({ id: undefined });
      const expectedUnit = HydrogenStorageUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreateHydrogenStorageUnit.mockResolvedValue(expectedUnit);

      // act
      const actualResult = await service.updateOrCreateHydrogenStorageUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUnit);
    });

    it('should check ownership before updating an existing unit when the payload contains an id', async () => {
      // arrange
      const givenPayload = CreateHydrogenStorageUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = 'company-1';
      const givenExistingUnit = HydrogenStorageUnitEntityFixture.create({
        id: givenPayload.id,
      });
      const expectedUpdatedUnit = HydrogenStorageUnitEntityFixture.create({ id: givenPayload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);
      unitRepositoryMock.updateOrCreateHydrogenStorageUnit.mockResolvedValue(expectedUpdatedUnit);

      // act
      const actualResult = await service.updateOrCreateHydrogenStorageUnit(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(givenPayload.id);
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUpdatedUnit);
    });

    it('should throw DomainException when the requester company does not own the existing unit', async () => {
      // arrange
      const givenPayload = CreateHydrogenStorageUnitPayloadFixture.create({ id: 'unit-1' });
      givenPayload.requesterCompanyId = 'company-2';
      const givenExistingUnit = HydrogenStorageUnitEntityFixture.create({
        id: givenPayload.id,
      });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);

      // act
      const actualResult = service.updateOrCreateHydrogenStorageUnit(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateUnitStatus', () => {
    it('should check ownership before updating the status when the requester owns the unit', async () => {
      // arrange
      const givenPayload = UpdateUnitStatusPayloadFixture.create({ id: 'unit-1', requesterCompanyId: 'company-1' });
      const givenExistingUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.id,
      });
      const expectedUpdatedUnit = PowerProductionUnitEntityFixture.create({ id: givenPayload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);
      unitRepositoryMock.updateUnitStatus.mockResolvedValue(expectedUpdatedUnit);

      // act
      const actualResult = await service.updateUnitStatus(givenPayload);

      // assert
      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(givenPayload.id);
      expect(unitRepositoryMock.updateUnitStatus).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(expectedUpdatedUnit);
    });

    it('should throw DomainException when the requester company does not own the unit', async () => {
      // arrange
      const givenPayload = UpdateUnitStatusPayloadFixture.create({ id: 'unit-1', requesterCompanyId: 'company-2' });
      const givenExistingUnit = PowerProductionUnitEntityFixture.create({
        id: givenPayload.id,
      });

      unitRepositoryMock.findUnitById.mockResolvedValue(givenExistingUnit);

      // act
      const actualResult = service.updateUnitStatus(givenPayload);

      // assert
      await expect(actualResult).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateUnitStatus).not.toHaveBeenCalled();
    });
  });
});
