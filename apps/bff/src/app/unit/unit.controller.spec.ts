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

  it('delegates all controller entry points to UnitService with the expected arguments', async () => {
    const hydrogenStorageInput = HydrogenStorageUnitInputDtoFixture.create();
    const powerProductionInput = PowerProductionUnitInputDtoFixture.create();
    const hydrogenProductionInput = HydrogenProductionUnitInputDtoFixture.create();
    const updateStatusDto = UnitUpdateActiveDtoFixture.create({ active: false });
    const hydrogenStorageOverview = [HydrogenStorageOverviewDtoFixture.create()];
    const hydrogenStorageUnit = HydrogenStorageUnitDtoFixture.create({ id: 'storage-unit-1' });
    const powerProductionOverview = [PowerProductionOverviewDtoFixture.create()];
    const powerProductionUnit = PowerProductionUnitDtoFixture.create({ id: 'power-unit-1' });
    const hydrogenProductionOverview = [HydrogenProductionOverviewDtoFixture.create()];
    const hydrogenProductionUnit = HydrogenProductionUnitDtoFixture.create({ id: 'hydrogen-unit-1' });

    unitServiceMock.readHydrogenStorageUnits.mockResolvedValue(hydrogenStorageOverview);
    unitServiceMock.readHydrogenStorageUnit.mockResolvedValue(hydrogenStorageUnit);
    unitServiceMock.createHydrogenStorageUnit.mockResolvedValue(hydrogenStorageUnit);
    unitServiceMock.readPowerProductionUnits.mockResolvedValue(powerProductionOverview);
    unitServiceMock.readPowerProductionUnit.mockResolvedValue(powerProductionUnit);
    unitServiceMock.createPowerProductionUnit.mockResolvedValue(powerProductionUnit);
    unitServiceMock.readHydrogenProductionUnits.mockResolvedValue(hydrogenProductionOverview);
    unitServiceMock.readHydrogenProductionUnit.mockResolvedValue(hydrogenProductionUnit);
    unitServiceMock.createHydrogenProductionUnit.mockResolvedValue(hydrogenProductionUnit);
    unitServiceMock.updateUnitStatus.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updatePowerProductionUnit.mockResolvedValue(undefined);
    unitServiceMock.updateHydrogenStorageUnit.mockResolvedValue(undefined);

    await expect(controller.getHydrogenStorageUnits(authenticatedUser)).resolves.toEqual(hydrogenStorageOverview);
    await expect(controller.getHydrogenStorageUnitById(hydrogenStorageUnit.id)).resolves.toEqual(hydrogenStorageUnit);
    await expect(controller.createHydrogenStorageUnit(authenticatedUser, hydrogenStorageInput)).resolves.toEqual(
      hydrogenStorageUnit,
    );
    await expect(controller.getPowerProductionUnits(authenticatedUser)).resolves.toEqual(powerProductionOverview);
    await expect(controller.getPowerProductionUnitById(powerProductionUnit.id)).resolves.toEqual(powerProductionUnit);
    await expect(controller.createPowerProductionUnit(authenticatedUser, powerProductionInput)).resolves.toEqual(
      powerProductionUnit,
    );
    await expect(controller.getHydrogenProductionUnits(authenticatedUser)).resolves.toEqual(
      hydrogenProductionOverview,
    );
    await expect(controller.getHydrogenProductionUnitById(hydrogenProductionUnit.id)).resolves.toEqual(
      hydrogenProductionUnit,
    );
    await expect(
      controller.createHydrogenProductionUnit(authenticatedUser, hydrogenProductionInput),
    ).resolves.toEqual(hydrogenProductionUnit);
    await expect(controller.updateUnitStatus(authenticatedUser, 'unit-id-1', updateStatusDto)).resolves.toBeUndefined();
    await expect(
      controller.updateHydrogenProductionUnit(authenticatedUser, 'hydrogen-unit-1', hydrogenProductionInput),
    ).resolves.toBeUndefined();
    await expect(
      controller.updatePowerProductionUnit(authenticatedUser, 'power-unit-1', powerProductionInput),
    ).resolves.toBeUndefined();
    await expect(
      controller.updateHydrogenStorageUnit(authenticatedUser, 'storage-unit-1', hydrogenStorageInput),
    ).resolves.toBeUndefined();

    expect(unitServiceMock.readHydrogenStorageUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readHydrogenStorageUnit).toHaveBeenCalledWith(hydrogenStorageUnit.id);
    expect(unitServiceMock.createHydrogenStorageUnit).toHaveBeenCalledWith(hydrogenStorageInput, authenticatedUser.sub);
    expect(unitServiceMock.readPowerProductionUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readPowerProductionUnit).toHaveBeenCalledWith(powerProductionUnit.id);
    expect(unitServiceMock.createPowerProductionUnit).toHaveBeenCalledWith(powerProductionInput, authenticatedUser.sub);
    expect(unitServiceMock.readHydrogenProductionUnits).toHaveBeenCalledWith(authenticatedUser.sub);
    expect(unitServiceMock.readHydrogenProductionUnit).toHaveBeenCalledWith(hydrogenProductionUnit.id);
    expect(unitServiceMock.createHydrogenProductionUnit).toHaveBeenCalledWith(
      hydrogenProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updateUnitStatus).toHaveBeenCalledWith('unit-id-1', updateStatusDto.active, authenticatedUser.sub);
    expect(unitServiceMock.updateHydrogenProductionUnit).toHaveBeenCalledWith(
      'hydrogen-unit-1',
      hydrogenProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updatePowerProductionUnit).toHaveBeenCalledWith(
      'power-unit-1',
      powerProductionInput,
      authenticatedUser.sub,
    );
    expect(unitServiceMock.updateHydrogenStorageUnit).toHaveBeenCalledWith(
      'storage-unit-1',
      hydrogenStorageInput,
      authenticatedUser.sub,
    );
  });
});