/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { META_PUBLIC } from 'nest-keycloak-connect';
import {
  type AuthenticatedKCUser,
  type BottlingOverviewDto,
  type DigitalProductPassportDto,
} from '@h2-trust/contracts/dtos';
import {
  BottlingDtoFixture,
  BottlingOverviewDtoFixture,
  DigitalProductPassportDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

describe('BottlingController', () => {
  let controller: BottlingController;

  const bottlingServiceMock = {
    createBottlingAndTransportation: jest.fn(),
    readBottlingsAndTransportationsByOwner: jest.fn(),
    readDigitalProductPassport: jest.fn(),
  };

  const authenticatedUser = { sub: 'user-id-1' } as AuthenticatedKCUser;

  beforeEach(() => {
    controller = new BottlingController(bottlingServiceMock as unknown as BottlingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates createBottlingAndTransportation to the service with uploaded files and user id', async () => {
    const dto = BottlingDtoFixture.create();
    const files = [{ originalname: 'evidence.pdf' }] as Express.Multer.File[];
    const result: BottlingOverviewDto = BottlingOverviewDtoFixture.create();

    bottlingServiceMock.createBottlingAndTransportation.mockResolvedValue(result);

    await expect(controller.createBottlingAndTransportation(dto, files, authenticatedUser)).resolves.toEqual(result);
    expect(bottlingServiceMock.createBottlingAndTransportation).toHaveBeenCalledWith(
      dto,
      files,
      authenticatedUser.sub,
    );
  });

  it('delegates readBottlingsAndTransportationsByOwner to the service with the authenticated user id', async () => {
    const result: BottlingOverviewDto[] = [BottlingOverviewDtoFixture.create()];

    bottlingServiceMock.readBottlingsAndTransportationsByOwner.mockResolvedValue(result);

    await expect(controller.readBottlingsAndTransportationsByOwner(authenticatedUser)).resolves.toEqual(result);
    expect(bottlingServiceMock.readBottlingsAndTransportationsByOwner).toHaveBeenCalledWith(authenticatedUser.sub);
  });

  it('delegates readDigitalProductPassport to the service by transportation id', async () => {
    const result: DigitalProductPassportDto = DigitalProductPassportDtoFixture.create({ id: 'dpp-1' });

    bottlingServiceMock.readDigitalProductPassport.mockResolvedValue(result);

    await expect(controller.readDigitalProductPassport(result.id)).resolves.toEqual(result);
    expect(bottlingServiceMock.readDigitalProductPassport).toHaveBeenCalledWith(result.id);
  });

  it('marks the digital product passport endpoint as public', () => {
    expect(Reflect.getMetadata(META_PUBLIC, BottlingController.prototype.readDigitalProductPassport)).toBe(true);
  });
});