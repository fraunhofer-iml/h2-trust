/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitInputDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitInputDto,
  HydrogenStorageUnitDto,
  PowerProductionOverviewDto,
  PowerProductionUnitInputDto,
  PowerProductionUnitDto,
  UnitUpdateActiveDto,
  type UserDetailsDto,
} from '@h2-trust/contracts/dtos';
import {
  HydrogenProductionUnitInputDtoFixture,
  HydrogenStorageUnitInputDtoFixture,
  PowerProductionUnitInputDtoFixture,
  UnitUpdateActiveDtoFixture,
  UserDetailsDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import {
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { UnitMessagePatterns } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';
import { UnitService } from './unit.service';

describe('UnitService', () => {
  let service: UnitService;

  const generalServiceMock = {
    send: jest.fn(),
  };

  const userServiceMock = {
    readUserWithCompany: jest.fn(),
  };

  beforeEach(() => {
    service = new UnitService(generalServiceMock as unknown as ClientProxy, userServiceMock as unknown as UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    {
      description: 'readPowerProductionUnit should request the unit by id and map the response',
      createUnit: () => PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      execute: (id: string) => service.readPowerProductionUnit(id),
      map: (unit: ReturnType<typeof PowerProductionUnitEntityFixture.create>) => PowerProductionUnitDto.fromEntity(unit),
    },
    {
      description: 'readHydrogenProductionUnit should request the unit by id and map the response',
      createUnit: () => HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      execute: (id: string) => service.readHydrogenProductionUnit(id),
      map: (unit: ReturnType<typeof HydrogenProductionUnitEntityFixture.create>) =>
        HydrogenProductionUnitDto.fromEntity(unit),
    },
    {
      description: 'readHydrogenStorageUnit should request the unit by id and map the response',
      createUnit: () => HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' }),
      execute: (id: string) => service.readHydrogenStorageUnit(id),
      map: (unit: ReturnType<typeof HydrogenStorageUnitEntityFixture.create>) => HydrogenStorageUnitDto.fromEntity(unit),
    },
  ])('$description', async ({ createUnit, execute, map }) => {
    const unit = createUnit();

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(unit));

    const actualResponse = await execute(unit.id);

    expect(generalServiceMock.send).toHaveBeenCalledWith(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(unit.id));
    expect(actualResponse).toEqual(map(unit));
  });

  it('readPowerProductionUnits should reject when the user company lookup fails', async () => {
    userServiceMock.readUserWithCompany.mockRejectedValue(new Error('user lookup failed'));

    await expect(service.readPowerProductionUnits('user-id-1')).rejects.toThrow('user lookup failed');

    expect(generalServiceMock.send).not.toHaveBeenCalled();
  });

  it('readHydrogenStorageUnit should propagate broker errors', async () => {
    generalServiceMock.send.mockImplementation((_pattern, _payload) => throwError(() => new Error('broker failed')));

    await expect(service.readHydrogenStorageUnit('storage-unit-1')).rejects.toThrow('broker failed');
  });

  it('readPowerProductionUnits should resolve the owner company and map the units', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const units = [PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(units));

    const actualResponse: PowerProductionOverviewDto[] = await service.readPowerProductionUnits(userId);

    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(userId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_POWER_PRODUCTION,
      new ReadByIdPayload(userDetails.company.id),
    );
    expect(actualResponse).toEqual(units.map(PowerProductionOverviewDto.fromEntity));
  });

  it('readHydrogenProductionUnits should resolve the owner company and map the units', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const units = [HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(units));

    const actualResponse: HydrogenProductionOverviewDto[] = await service.readHydrogenProductionUnits(userId);

    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(userId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_PRODUCTION,
      new ReadByIdPayload(userDetails.company.id),
    );
    expect(actualResponse).toEqual(units.map(HydrogenProductionOverviewDto.fromEntity));
  });

  it('readHydrogenStorageUnits should resolve the owner company and map the units', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const units = [HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(units));

    const actualResponse: HydrogenStorageOverviewDto[] = await service.readHydrogenStorageUnits(userId);

    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(userId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_STORAGE,
      new ReadByIdPayload(userDetails.company.id),
    );
    expect(actualResponse).toEqual(units.map(HydrogenStorageOverviewDto.fromEntity));
  });

  it('createPowerProductionUnit should include the requesters company in the payload', async () => {
    const userId = 'user-id-1';
    const dto = PowerProductionUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const unit = PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(unit));

    const actualResponse = await service.createPowerProductionUnit(dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_POWER_PRODUCTION,
      PowerProductionUnitInputDto.toPayload(dto, undefined, userDetails.company.id),
    );
    expect(actualResponse).toEqual(PowerProductionUnitDto.fromEntity(unit));
  });

  it('createHydrogenProductionUnit should include the requesters company in the payload', async () => {
    const userId = 'user-id-1';
    const dto = HydrogenProductionUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const unit = HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(unit));

    const actualResponse = await service.createHydrogenProductionUnit(dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION,
      HydrogenProductionUnitInputDto.toPayload(dto, undefined, userDetails.company.id),
    );
    expect(actualResponse).toEqual(HydrogenProductionUnitDto.fromEntity(unit));
  });

  it('createHydrogenStorageUnit should include the requesters company in the payload', async () => {
    const userId = 'user-id-1';
    const dto = HydrogenStorageUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const unit = HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(unit));

    const actualResponse = await service.createHydrogenStorageUnit(dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_STORAGE,
      HydrogenStorageUnitInputDto.toPayload(dto, undefined, userDetails.company.id),
    );
    expect(actualResponse).toEqual(HydrogenStorageUnitDto.fromEntity(unit));
  });

  it('updateUnitStatus should send the active flag with the requesters company id', async () => {
    const userId = 'user-id-1';
    const unitId = 'unit-id-1';
    const dto = UnitUpdateActiveDtoFixture.create({ active: false });
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    await service.updateUnitStatus(unitId, dto.active, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_STATUS,
      UnitUpdateActiveDto.toPayload(unitId, dto.active, userDetails.company.id),
    );
  });

  it('updateHydrogenProductionUnit should send the update payload with requester company context', async () => {
    const userId = 'user-id-1';
    const unitId = 'unit-id-1';
    const dto = HydrogenProductionUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    await service.updateHydrogenProductionUnit(unitId, dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION,
      HydrogenProductionUnitInputDto.toPayload(dto, unitId, userDetails.company.id),
    );
  });

  it('updatePowerProductionUnit should send the update payload with requester company context', async () => {
    const userId = 'user-id-1';
    const unitId = 'unit-id-1';
    const dto = PowerProductionUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    await service.updatePowerProductionUnit(unitId, dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_POWER_PRODUCTION,
      PowerProductionUnitInputDto.toPayload(dto, unitId, userDetails.company.id),
    );
  });

  it('updateHydrogenStorageUnit should send the update payload with requester company context', async () => {
    const userId = 'user-id-1';
    const unitId = 'unit-id-1';
    const dto = HydrogenStorageUnitInputDtoFixture.create();
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    await service.updateHydrogenStorageUnit(unitId, dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE,
      HydrogenStorageUnitInputDto.toPayload(dto, unitId, userDetails.company.id),
    );
  });
});