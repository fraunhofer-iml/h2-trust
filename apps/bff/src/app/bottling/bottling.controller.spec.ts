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

  it('should delegate createBottlingAndTransportation to the service when uploaded files are provided', async () => {
    // arrange
    const givenDto = BottlingDtoFixture.create();
    const givenFiles = [{ originalname: 'evidence.pdf' }] as Express.Multer.File[];
    const expectedOverview: BottlingOverviewDto = BottlingOverviewDtoFixture.create();

    bottlingServiceMock.createBottlingAndTransportation.mockResolvedValue(expectedOverview);

    // act
    const actualResult = await controller.createBottlingAndTransportation(givenDto, givenFiles, authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedOverview);
    expect(bottlingServiceMock.createBottlingAndTransportation).toHaveBeenCalledWith(
      givenDto,
      givenFiles,
      authenticatedUser.sub,
    );
  });

  it('should delegate readBottlingsAndTransportationsByOwner to the service when the authenticated user requests them', async () => {
    // arrange
    const expectedOverviews: BottlingOverviewDto[] = [BottlingOverviewDtoFixture.create()];

    bottlingServiceMock.readBottlingsAndTransportationsByOwner.mockResolvedValue(expectedOverviews);

    // act
    const actualResult = await controller.readBottlingsAndTransportationsByOwner(authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedOverviews);
    expect(bottlingServiceMock.readBottlingsAndTransportationsByOwner).toHaveBeenCalledWith(authenticatedUser.sub);
  });

  it('should delegate readDigitalProductPassport to the service when a transportation id is provided', async () => {
    // arrange
    const expectedPassport: DigitalProductPassportDto = DigitalProductPassportDtoFixture.create({ id: 'dpp-1' });

    bottlingServiceMock.readDigitalProductPassport.mockResolvedValue(expectedPassport);

    // act
    const actualResult = await controller.readDigitalProductPassport(expectedPassport.id);

    // assert
    expect(actualResult).toEqual(expectedPassport);
    expect(bottlingServiceMock.readDigitalProductPassport).toHaveBeenCalledWith(expectedPassport.id);
  });

  it('should mark the digital product passport endpoint as public when reading its metadata', () => {
    // act
    const actualResult = Reflect.getMetadata(META_PUBLIC, BottlingController.prototype.readDigitalProductPassport);

    // assert
    expect(actualResult).toBe(true);
  });
});
