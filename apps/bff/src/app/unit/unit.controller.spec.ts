/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { type AuthenticatedKCUser } from '@h2-trust/contracts/dtos';
import {
  HydrogenProductionOverviewDtoFixture,
  HydrogenProductionUnitDtoFixture,
  HydrogenProductionUnitInputDtoFixture,
  HydrogenStorageOverviewDtoFixture,
  HydrogenStorageUnitDtoFixture,
  HydrogenStorageUnitInputDtoFixture,
  PowerProductionOverviewDtoFixture,
  PowerProductionUnitDtoFixture,
  PowerProductionUnitInputDtoFixture,
  UnitUpdateActiveDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { UnitType } from '@h2-trust/domain';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;

  const unitServiceMock = {
    createHydrogenStorageUnit: jest.fn(),
    readUnits: jest.fn(),
    readUnitById: jest.fn(),
    createHydrogenProductionUnit: jest.fn(),
    createPowerProductionUnit: jest.fn(),
    updateUnitStatus: jest.fn(),
    updateHydrogenProductionUnit: jest.fn(),
    updatePowerProductionUnit: jest.fn(),
    updateHydrogenStorageUnit: jest.fn(),
  };

  const authenticatedUser = { sub: 'user-id-1' } as AuthenticatedKCUser;

  beforeEach(() => {
    controller = new UnitController(unitServiceMock as unknown as UnitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate all controller entry points to UnitService when each endpoint is invoked', async () => {
    // arrange
    const givenHydrogenStorageInput = HydrogenStorageUnitInputDtoFixture.create();
    const givenPowerProductionInput = PowerProductionUnitInputDtoFixture.create();
    const givenHydrogenProductionInput = HydrogenProductionUnitInputDtoFixture.create();
    const givenUpdateStatusDto = UnitUpdateActiveDtoFixture.create({ active: false });
    const expectedHydrogenStorageOverview = [HydrogenStorageOverviewDtoFixture.create()];
    const expectedHydrogenStorageUnit = HydrogenStorageUnitDtoFixture.create({ id: 'storage-unit-1' });
    const expectedPowerProductionOverview = [PowerProductionOverviewDtoFixture.create()];

    const expectedPowerProductionUnit = PowerProductionUnitDtoFixture.create({ id: 'power-unit-1' });
    const expectedHydrogenProductionOverview = [HydrogenProductionOverviewDtoFixture.create()];
    const expectedHydrogenProductionUnit = HydrogenProductionUnitDtoFixture.create({ id: 'hydrogen-unit-1' });

    unitServiceMock.readUnits.mockImplementation(async (_userId: string, type?: UnitType) => {
      switch (type) {
        case UnitType.HYDROGEN_STORAGE:
          return expectedHydrogenStorageOverview;
        case UnitType.POWER_PRODUCTION:
          return expectedPowerProductionOverview;
        case UnitType.HYDROGEN_PRODUCTION:
          return expectedHydrogenProductionOverview;
        default:
          return [expectedHydrogenProductionOverview, expectedHydrogenStorageOverview, expectedPowerProductionOverview];
      }
    });
    unitServiceMock.createHydrogenStorageUnit.mockResolvedValue(expectedHydrogenStorageUnit);
    unitServiceMock.createPowerProductionUnit.mockResolvedValue(expectedPowerProductionUnit);
    unitServiceMock.readUnitById.mockResolvedValue(expectedHydrogenProductionUnit);
    unitServiceMock.createHydrogenProductionUnit.mockResolvedValue(expectedHydrogenProductionUnit);
    unitServiceMock.updateUnitStatus.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updatePowerProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenStorageUnit.mockResolvedValue(undefined);

    // act
    const actualHydrogenStorageOverview = await controller.getUnits(authenticatedUser, UnitType.HYDROGEN_STORAGE);
    const actualCreatedHydrogenStorageUnit = await controller.createHydrogenStorageUnit(
      authenticatedUser,
      givenHydrogenStorageInput,
    );
    const actualPowerProductionOverview = await controller.getUnits(authenticatedUser, UnitType.POWER_PRODUCTION);
    const actualCreatedPowerProductionUnit = await controller.createPowerProductionUnit(
      authenticatedUser,
      givenPowerProductionInput,
    );
    const actualHydrogenProductionOverview = await controller.getUnits(authenticatedUser, UnitType.HYDROGEN_PRODUCTION);
    const actualHydrogenProductionUnit = await controller.getUnitById(expectedHydrogenProductionUnit.id);
    const actualCreatedHydrogenProductionUnit = await controller.createHydrogenProductionUnit(
      authenticatedUser,
      givenHydrogenProductionInput,
    );
    const actualUpdateUnitStatusResult = await controller.updateUnitStatus(
      authenticatedUser,
      'unit-id-1',
      givenUpdateStatusDto,
    );
    const actualUpdateHydrogenProductionUnitResult = await controller.updateHydrogenProductionUnit(
      authenticatedUser,
      'hydrogen-unit-1',
      givenHydrogenProductionInput,
    );
    const actualUpdatePowerProductionUnitResult = await controller.updatePowerProductionUnit(
      authenticatedUser,
      'power-unit-1',
      givenPowerProductionInput,
    );
    const actualUpdateHydrogenStorageUnitResult = await controller.updateHydrogenStorageUnit(
      authenticatedUser,
      'storage-unit-1',
      givenHydrogenStorageInput,
    );

    // assert
    expect(actualHydrogenStorageOverview).toEqual(expectedHydrogenStorageOverview);
    expect(actualCreatedHydrogenStorageUnit).toEqual(expectedHydrogenStorageUnit);
    expect(actualPowerProductionOverview).toEqual(expectedPowerProductionOverview);
    expect(actualCreatedPowerProductionUnit).toEqual(expectedPowerProductionUnit);
    expect(actualHydrogenProductionOverview).toEqual(expectedHydrogenProductionOverview);
    expect(actualHydrogenProductionUnit).toEqual(expectedHydrogenProductionUnit);
    expect(actualCreatedHydrogenProductionUnit).toEqual(expectedHydrogenProductionUnit);
    expect(actualUpdateUnitStatusResult).toBeUndefined();
    expect(actualUpdateHydrogenProductionUnitResult).toBeUndefined();
    expect(actualUpdatePowerProductionUnitResult).toBeUndefined();
    expect(actualUpdateHydrogenStorageUnitResult).toBeUndefined();
    expect(unitServiceMock.readUnits).toHaveBeenCalledWith(authenticatedUser.sub, UnitType.HYDROGEN_STORAGE);
    expect(unitServiceMock.createHydrogenStorageUnit).toHaveBeenCalledWith(
      givenHydrogenStorageInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.readUnits).toHaveBeenCalledWith(authenticatedUser.sub, UnitType.POWER_PRODUCTION);
    expect(unitServiceMock.createPowerProductionUnit).toHaveBeenCalledWith(
      givenPowerProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.readUnits).toHaveBeenCalledWith(authenticatedUser.sub, UnitType.HYDROGEN_PRODUCTION);
    expect(unitServiceMock.readUnitById).toHaveBeenCalledWith(expectedHydrogenProductionUnit.id);
    expect(unitServiceMock.createHydrogenProductionUnit).toHaveBeenCalledWith(
      givenHydrogenProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updateUnitStatus).toHaveBeenCalledWith(
      'unit-id-1',
      givenUpdateStatusDto.active,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updateHydrogenProductionUnit).toHaveBeenCalledWith(
      'hydrogen-unit-1',
      givenHydrogenProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updatePowerProductionUnit).toHaveBeenCalledWith(
      'power-unit-1',
      givenPowerProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updateHydrogenStorageUnit).toHaveBeenCalledWith(
      'storage-unit-1',
      givenHydrogenStorageInput,
      authenticatedUser.sub,
    );
  });
});
