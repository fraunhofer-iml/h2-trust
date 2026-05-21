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
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;

  const unitServiceMock = {
    readHydrogenStorageUnits: jest.fn(),
    readHydrogenStorageUnit: jest.fn(),
    createHydrogenStorageUnit: jest.fn(),
    readPowerProductionUnits: jest.fn(),
    readPowerProductionUnit: jest.fn(),
    createPowerProductionUnit: jest.fn(),
    readHydrogenProductionUnits: jest.fn(),
    readHydrogenProductionUnit: jest.fn(),
    createHydrogenProductionUnit: jest.fn(),
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

    unitServiceMock.readHydrogenStorageUnits.mockResolvedValue(expectedHydrogenStorageOverview);
    unitServiceMock.readHydrogenStorageUnit.mockResolvedValue(expectedHydrogenStorageUnit);
    unitServiceMock.createHydrogenStorageUnit.mockResolvedValue(expectedHydrogenStorageUnit);
    unitServiceMock.readPowerProductionUnits.mockResolvedValue(expectedPowerProductionOverview);
    unitServiceMock.readPowerProductionUnit.mockResolvedValue(expectedPowerProductionUnit);
    unitServiceMock.createPowerProductionUnit.mockResolvedValue(expectedPowerProductionUnit);
    unitServiceMock.readHydrogenProductionUnits.mockResolvedValue(expectedHydrogenProductionOverview);
    unitServiceMock.readHydrogenProductionUnit.mockResolvedValue(expectedHydrogenProductionUnit);
    unitServiceMock.createHydrogenProductionUnit.mockResolvedValue(expectedHydrogenProductionUnit);
    unitServiceMock.updateUnitStatus.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updatePowerProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenStorageUnit.mockResolvedValue(undefined);

    // act
    const actualHydrogenStorageOverview = await controller.getHydrogenStorageUnits(authenticatedUser);
    const actualHydrogenStorageUnit = await controller.getHydrogenStorageUnitById(expectedHydrogenStorageUnit.id);
    const actualCreatedHydrogenStorageUnit = await controller.createHydrogenStorageUnit(
      authenticatedUser,
      givenHydrogenStorageInput,
    );
    const actualPowerProductionOverview = await controller.getPowerProductionUnits(authenticatedUser);
    const actualPowerProductionUnit = await controller.getPowerProductionUnitById(expectedPowerProductionUnit.id);
    const actualCreatedPowerProductionUnit = await controller.createPowerProductionUnit(
      authenticatedUser,
      givenPowerProductionInput,
    );
    const actualHydrogenProductionOverview = await controller.getHydrogenProductionUnits(authenticatedUser);
    const actualHydrogenProductionUnit = await controller.getHydrogenProductionUnitById(
      expectedHydrogenProductionUnit.id,
    );
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
    expect(actualHydrogenStorageUnit).toEqual(expectedHydrogenStorageUnit);
    expect(actualCreatedHydrogenStorageUnit).toEqual(expectedHydrogenStorageUnit);
    expect(actualPowerProductionOverview).toEqual(expectedPowerProductionOverview);
    expect(actualPowerProductionUnit).toEqual(expectedPowerProductionUnit);
    expect(actualCreatedPowerProductionUnit).toEqual(expectedPowerProductionUnit);
    expect(actualHydrogenProductionOverview).toEqual(expectedHydrogenProductionOverview);
    expect(actualHydrogenProductionUnit).toEqual(expectedHydrogenProductionUnit);
    expect(actualCreatedHydrogenProductionUnit).toEqual(expectedHydrogenProductionUnit);
    expect(actualUpdateUnitStatusResult).toBeUndefined();
    expect(actualUpdateHydrogenProductionUnitResult).toBeUndefined();
    expect(actualUpdatePowerProductionUnitResult).toBeUndefined();
    expect(actualUpdateHydrogenStorageUnitResult).toBeUndefined();
    expect(unitServiceMock.readHydrogenStorageUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readHydrogenStorageUnit).toHaveBeenCalledWith(expectedHydrogenStorageUnit.id);
    expect(unitServiceMock.createHydrogenStorageUnit).toHaveBeenCalledWith(
      givenHydrogenStorageInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.readPowerProductionUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readPowerProductionUnit).toHaveBeenCalledWith(expectedPowerProductionUnit.id);
    expect(unitServiceMock.createPowerProductionUnit).toHaveBeenCalledWith(
      givenPowerProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.readHydrogenProductionUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readHydrogenProductionUnit).toHaveBeenCalledWith(expectedHydrogenProductionUnit.id);
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
