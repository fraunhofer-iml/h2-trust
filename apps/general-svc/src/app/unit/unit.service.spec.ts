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
  PowerProductionTypeEntityFixture,
  PowerProductionUnitEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenProductionUnitPayloadFixture,
  CreateHydrogenStorageUnitPayloadFixture,
  CreatePowerProductionUnitPayloadFixture,
  UpdateUnitStatusPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import { ReadByIdPayload, ReadByIdsPayload } from '@h2-trust/contracts/payloads';
import { PowerProductionTypeRepository, UnitRepository } from '@h2-trust/database';
import { DomainException } from '@h2-trust/exceptions';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;

  const unitRepositoryMock = {
    findUnitById: jest.fn(),
    findUnitsByIds: jest.fn(),
    findPowerProductionUnitsByOwnerId: jest.fn(),
    findPowerProductionUnitsByIds: jest.fn(),
    findHydrogenProductionUnitsByOwnerId: jest.fn(),
    findHydrogenProductionUnitsByIds: jest.fn(),
    findHydrogenStorageUnitsByOwnerId: jest.fn(),
    updateOrCreateHydrogenProductionUnit: jest.fn(),
    updateOrCreatePowerProductionUnit: jest.fn(),
    updateOrCreateHydrogenStorageUnit: jest.fn(),
    updateUnitStatus: jest.fn(),
  };

  const powerProductionTypeRepositoryMock = {
    findPowerProductionTypes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: UnitRepository,
          useValue: unitRepositoryMock,
        },
        {
          provide: PowerProductionTypeRepository,
          useValue: powerProductionTypeRepositoryMock,
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
    it('delegates readUnitById to UnitRepository', async () => {
      const unit = PowerProductionUnitEntityFixture.create();
      unitRepositoryMock.findUnitById.mockResolvedValue(unit);

      const actualResult = await service.readUnitById(unit.id);

      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(unit.id);
      expect(actualResult).toEqual(unit);
    });

    it('delegates readUnitsByIds to UnitRepository', async () => {
      const payload = new ReadByIdsPayload(['unit-1', 'unit-2']);
      const units = [PowerProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findUnitsByIds.mockResolvedValue(units);

      const actualResult = await service.readUnitsByIds(payload.ids);

      expect(unitRepositoryMock.findUnitsByIds).toHaveBeenCalledWith(payload.ids);
      expect(actualResult).toEqual(units);
    });

    it('delegates readPowerProductionUnitsByOwnerId to UnitRepository', async () => {
      const payload = new ReadByIdPayload('company-1');
      const units = [PowerProductionUnitEntityFixture.create()];
      unitRepositoryMock.findPowerProductionUnitsByOwnerId.mockResolvedValue(units);

      const actualResult = await service.readPowerProductionUnitsByOwnerId(payload);

      expect(unitRepositoryMock.findPowerProductionUnitsByOwnerId).toHaveBeenCalledWith(payload.id);
      expect(actualResult).toEqual(units);
    });

    it('delegates readPowerProductionUnitsByIds to UnitRepository', async () => {
      const payload = new ReadByIdsPayload(['unit-1']);
      const units = [PowerProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findPowerProductionUnitsByIds.mockResolvedValue(units);

      const actualResult = await service.readPowerProductionUnitsByIds(payload);

      expect(unitRepositoryMock.findPowerProductionUnitsByIds).toHaveBeenCalledWith(payload.ids);
      expect(actualResult).toEqual(units);
    });

    it('delegates readHydrogenProductionUnitsByOwnerId to UnitRepository', async () => {
      const payload = new ReadByIdPayload('company-1');
      const units = [HydrogenProductionUnitEntityFixture.create()];
      unitRepositoryMock.findHydrogenProductionUnitsByOwnerId.mockResolvedValue(units);

      const actualResult = await service.readHydrogenProductionUnitsByOwnerId(payload);

      expect(unitRepositoryMock.findHydrogenProductionUnitsByOwnerId).toHaveBeenCalledWith(payload.id);
      expect(actualResult).toEqual(units);
    });

    it('delegates readHydrogenProductionUnitsByIds to UnitRepository', async () => {
      const payload = new ReadByIdsPayload(['unit-1']);
      const units = [HydrogenProductionUnitEntityFixture.create({ id: 'unit-1' })];
      unitRepositoryMock.findHydrogenProductionUnitsByIds.mockResolvedValue(units);

      const actualResult = await service.readHydrogenProductionUnitsByIds(payload);

      expect(unitRepositoryMock.findHydrogenProductionUnitsByIds).toHaveBeenCalledWith(payload.ids);
      expect(actualResult).toEqual(units);
    });

    it('delegates readHydrogenStorageUnitsByOwnerId to UnitRepository', async () => {
      const payload = new ReadByIdPayload('company-1');
      const units = [HydrogenStorageUnitEntityFixture.create()];
      unitRepositoryMock.findHydrogenStorageUnitsByOwnerId.mockResolvedValue(units);

      const actualResult = await service.readHydrogenStorageUnitsByOwnerId(payload);

      expect(unitRepositoryMock.findHydrogenStorageUnitsByOwnerId).toHaveBeenCalledWith(payload.id);
      expect(actualResult).toEqual(units);
    });

    it('delegates readPowerProductionTypes to PowerProductionTypeRepository', async () => {
      const powerProductionTypes = [PowerProductionTypeEntityFixture.createGrid()];
      powerProductionTypeRepositoryMock.findPowerProductionTypes.mockResolvedValue(powerProductionTypes);

      const actualResult = await service.readPowerProductionTypes();

      expect(powerProductionTypeRepositoryMock.findPowerProductionTypes).toHaveBeenCalled();
      expect(actualResult).toEqual(powerProductionTypes);
    });
  });

  describe('updateOrCreateHydrogenProductionUnit', () => {
    it('delegates directly when the payload has no id', async () => {
      const payload = CreateHydrogenProductionUnitPayloadFixture.create({ id: undefined });
      const unit = HydrogenProductionUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreateHydrogenProductionUnit.mockResolvedValue(unit);

      const actualResult = await service.updateOrCreateHydrogenProductionUnit(payload);

      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(unit);
    });

    it('checks ownership before updating an existing unit', async () => {
      const payload = CreateHydrogenProductionUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = 'company-1';
      const existingUnit = HydrogenProductionUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });
      const updatedUnit = HydrogenProductionUnitEntityFixture.create({ id: payload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);
      unitRepositoryMock.updateOrCreateHydrogenProductionUnit.mockResolvedValue(updatedUnit);

      const actualResult = await service.updateOrCreateHydrogenProductionUnit(payload);

      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(payload.id);
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(updatedUnit);
    });

    it('throws when requester company does not own the existing unit', async () => {
      const payload = CreateHydrogenProductionUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = 'company-2';
      const existingUnit = HydrogenProductionUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);

      await expect(service.updateOrCreateHydrogenProductionUnit(payload)).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateOrCreateHydrogenProductionUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateOrCreatePowerProductionUnit', () => {
    it('delegates directly when the payload has no id', async () => {
      const payload = CreatePowerProductionUnitPayloadFixture.create({ id: undefined });
      const unit = PowerProductionUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreatePowerProductionUnit.mockResolvedValue(unit);

      const actualResult = await service.updateOrCreatePowerProductionUnit(payload);

      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(unit);
    });

    it('checks ownership before updating an existing unit', async () => {
      const payload = CreatePowerProductionUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = 'company-1';
      const existingUnit = PowerProductionUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });
      const updatedUnit = PowerProductionUnitEntityFixture.create({ id: payload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);
      unitRepositoryMock.updateOrCreatePowerProductionUnit.mockResolvedValue(updatedUnit);

      const actualResult = await service.updateOrCreatePowerProductionUnit(payload);

      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(payload.id);
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(updatedUnit);
    });

    it('throws when requesterCompanyId is missing for an update', async () => {
      const payload = CreatePowerProductionUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = undefined;

      await expect(service.updateOrCreatePowerProductionUnit(payload)).rejects.toThrow('requesterCompanyId');
      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreatePowerProductionUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateOrCreateHydrogenStorageUnit', () => {
    it('delegates directly when the payload has no id', async () => {
      const payload = CreateHydrogenStorageUnitPayloadFixture.create({ id: undefined });
      const unit = HydrogenStorageUnitEntityFixture.create();
      unitRepositoryMock.updateOrCreateHydrogenStorageUnit.mockResolvedValue(unit);

      const actualResult = await service.updateOrCreateHydrogenStorageUnit(payload);

      expect(unitRepositoryMock.findUnitById).not.toHaveBeenCalled();
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(unit);
    });

    it('checks ownership before updating an existing unit', async () => {
      const payload = CreateHydrogenStorageUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = 'company-1';
      const existingUnit = HydrogenStorageUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });
      const updatedUnit = HydrogenStorageUnitEntityFixture.create({ id: payload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);
      unitRepositoryMock.updateOrCreateHydrogenStorageUnit.mockResolvedValue(updatedUnit);

      const actualResult = await service.updateOrCreateHydrogenStorageUnit(payload);

      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(payload.id);
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(updatedUnit);
    });

    it('throws when requester company does not own the existing unit', async () => {
      const payload = CreateHydrogenStorageUnitPayloadFixture.create({ id: 'unit-1' });
      payload.requesterCompanyId = 'company-2';
      const existingUnit = HydrogenStorageUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);

      await expect(service.updateOrCreateHydrogenStorageUnit(payload)).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateOrCreateHydrogenStorageUnit).not.toHaveBeenCalled();
    });
  });

  describe('updateUnitStatus', () => {
    it('checks ownership before updating the status', async () => {
      const payload = UpdateUnitStatusPayloadFixture.create({ id: 'unit-1', requesterCompanyId: 'company-1' });
      const existingUnit = PowerProductionUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });
      const updatedUnit = PowerProductionUnitEntityFixture.create({ id: payload.id });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);
      unitRepositoryMock.updateUnitStatus.mockResolvedValue(updatedUnit);

      const actualResult = await service.updateUnitStatus(payload);

      expect(unitRepositoryMock.findUnitById).toHaveBeenCalledWith(payload.id);
      expect(unitRepositoryMock.updateUnitStatus).toHaveBeenCalledWith(payload);
      expect(actualResult).toEqual(updatedUnit);
    });

    it('throws when requester company does not own the unit', async () => {
      const payload = UpdateUnitStatusPayloadFixture.create({ id: 'unit-1', requesterCompanyId: 'company-2' });
      const existingUnit = PowerProductionUnitEntityFixture.create({ id: payload.id, owner: { id: 'company-1' } });

      unitRepositoryMock.findUnitById.mockResolvedValue(existingUnit);

      await expect(service.updateUnitStatus(payload)).rejects.toThrow(DomainException);
      expect(unitRepositoryMock.updateUnitStatus).not.toHaveBeenCalled();
    });
  });
});