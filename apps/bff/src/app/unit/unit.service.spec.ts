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
      description: 'should request the unit by id and map the response when reading a power production unit',
      createUnit: () => PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      execute: (id: string) => service.readPowerProductionUnit(id),
      map: (unit: ReturnType<typeof PowerProductionUnitEntityFixture.create>) => PowerProductionUnitDto.fromEntity(unit),
    },
    {
      description: 'should request the unit by id and map the response when reading a hydrogen production unit',
      createUnit: () => HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' }),
      execute: (id: string) => service.readHydrogenProductionUnit(id),
      map: (unit: ReturnType<typeof HydrogenProductionUnitEntityFixture.create>) =>
        HydrogenProductionUnitDto.fromEntity(unit),
    },
    {
      description: 'should request the unit by id and map the response when reading a hydrogen storage unit',
      createUnit: () => HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' }),
      execute: (id: string) => service.readHydrogenStorageUnit(id),
      map: (unit: ReturnType<typeof HydrogenStorageUnitEntityFixture.create>) => HydrogenStorageUnitDto.fromEntity(unit),
    },
  ])('$description', async ({ createUnit, execute, map }) => {
    // arrange
    const expectedUnit = createUnit();

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnit));

    // act
    const actualResult = await execute(expectedUnit.id);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(expectedUnit.id));
    expect(actualResult).toEqual(map(expectedUnit));
  });

  it('should reject when the user company lookup fails while reading power production units', async () => {
  // arrange
    userServiceMock.readUserWithCompany.mockRejectedValue(new Error('user lookup failed'));

    // act
    const actualResult = service.readPowerProductionUnits('user-id-1');

    // assert
    await expect(actualResult).rejects.toThrow('user lookup failed');
    expect(generalServiceMock.send).not.toHaveBeenCalled();
  });

  it('should propagate broker errors when reading a hydrogen storage unit', async () => {
  // arrange
    generalServiceMock.send.mockImplementation((_pattern, _payload) => throwError(() => new Error('broker failed')));

    // act
    const actualResult = service.readHydrogenStorageUnit('storage-unit-1');

    // assert
    await expect(actualResult).rejects.toThrow('broker failed');
  });

  it('should resolve the owner company and map the units when reading power production units', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnits = [PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnits));

    // act
    const actualResult: PowerProductionOverviewDto[] = await service.readPowerProductionUnits(givenUserId);

    // assert
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(givenUserId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_POWER_PRODUCTION,
      new ReadByIdPayload(givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(expectedUnits.map(PowerProductionOverviewDto.fromEntity));
  });

  it('should resolve the owner company and map the units when reading hydrogen production units', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnits = [HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnits));

    // act
    const actualResult: HydrogenProductionOverviewDto[] = await service.readHydrogenProductionUnits(givenUserId);

    // assert
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(givenUserId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_PRODUCTION,
      new ReadByIdPayload(givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(expectedUnits.map(HydrogenProductionOverviewDto.fromEntity));
  });

  it('should resolve the owner company and map the units when reading hydrogen storage units', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnits = [HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' })];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnits));

    // act
    const actualResult: HydrogenStorageOverviewDto[] = await service.readHydrogenStorageUnits(givenUserId);

    // assert
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(givenUserId);
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_STORAGE,
      new ReadByIdPayload(givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(expectedUnits.map(HydrogenStorageOverviewDto.fromEntity));
  });

  it('should include the requester company in the payload when creating a power production unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenDto = PowerProductionUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnit = PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnit));

    // act
    const actualResult = await service.createPowerProductionUnit(givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_POWER_PRODUCTION,
      PowerProductionUnitInputDto.toPayload(givenDto, undefined, givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(PowerProductionUnitDto.fromEntity(expectedUnit));
  });

  it('should include the requester company in the payload when creating a hydrogen production unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenDto = HydrogenProductionUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnit = HydrogenProductionUnitEntityFixture.create({ id: 'hydrogen-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnit));

    // act
    const actualResult = await service.createHydrogenProductionUnit(givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION,
      HydrogenProductionUnitInputDto.toPayload(givenDto, undefined, givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(HydrogenProductionUnitDto.fromEntity(expectedUnit));
  });

  it('should include the requester company in the payload when creating a hydrogen storage unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenDto = HydrogenStorageUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const expectedUnit = HydrogenStorageUnitEntityFixture.create({ id: 'storage-unit-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUnit));

    // act
    const actualResult = await service.createHydrogenStorageUnit(givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_STORAGE,
      HydrogenStorageUnitInputDto.toPayload(givenDto, undefined, givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(HydrogenStorageUnitDto.fromEntity(expectedUnit));
  });

  it('should send the active flag with the requester company id when updating unit status', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUnitId = 'unit-id-1';
    const givenDto = UnitUpdateActiveDtoFixture.create({ active: false });
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    // act
    await service.updateUnitStatus(givenUnitId, givenDto.active, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_STATUS,
      UnitUpdateActiveDto.toPayload(givenUnitId, givenDto.active, givenUserDetails.company.id),
    );
  });

  it('should send the update payload with requester company context when updating a hydrogen production unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUnitId = 'unit-id-1';
    const givenDto = HydrogenProductionUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    // act
    await service.updateHydrogenProductionUnit(givenUnitId, givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION,
      HydrogenProductionUnitInputDto.toPayload(givenDto, givenUnitId, givenUserDetails.company.id),
    );
  });

  it('should send the update payload with requester company context when updating a power production unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUnitId = 'unit-id-1';
    const givenDto = PowerProductionUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    // act
    await service.updatePowerProductionUnit(givenUnitId, givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_POWER_PRODUCTION,
      PowerProductionUnitInputDto.toPayload(givenDto, givenUnitId, givenUserDetails.company.id),
    );
  });

  it('should send the update payload with requester company context when updating a hydrogen storage unit', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUnitId = 'unit-id-1';
    const givenDto = HydrogenStorageUnitInputDtoFixture.create();
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(undefined));

    // act
    await service.updateHydrogenStorageUnit(givenUnitId, givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE,
      HydrogenStorageUnitInputDto.toPayload(givenDto, givenUnitId, givenUserDetails.company.id),
    );
  });
});