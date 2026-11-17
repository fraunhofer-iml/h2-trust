/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { META_PUBLIC } from 'nest-keycloak-connect';
import {
  ProcessStepActivityDto,
  ProcessStepOwnershipStatus,
  type AuthenticatedKCUser,
  type DigitalProductPassportDto,
  type ProcessStepOverviewDto,
} from '@h2-trust/contracts/dtos';
import {
  BottlingOverviewDtoFixture,
  CreateProcessStepDtoFixture,
  DigitalProductPassportDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { ProcessType, RfnboType } from '@h2-trust/domain';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepController', () => {
  let controller: ProcessStepController;

  const processStepServiceMock = {
    createProcessStep: jest.fn(),
    readHydrogenComponentsForUnits: jest.fn(),
    readHydrogenComponentsForOwnUnits: jest.fn(),
    readDigitalProductPassport: jest.fn(),
    readProcessStepActivity: jest.fn(),
  };

  const authenticatedUser = { sub: 'user-id-1' } as AuthenticatedKCUser;

  beforeEach(() => {
    controller = new ProcessStepController(processStepServiceMock as unknown as ProcessStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate createProcessStep to the service when uploaded files are provided', async () => {
    // arrange
    const givenDto = CreateProcessStepDtoFixture.create();
    const givenFiles = [{ originalname: 'evidence.pdf' }] as Express.Multer.File[];
    const expectedOverview: ProcessStepOverviewDto = BottlingOverviewDtoFixture.create();

    processStepServiceMock.createProcessStep.mockResolvedValue(expectedOverview);

    // act
    const actualResult = await controller.createProcessStep(givenDto, givenFiles, authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedOverview);
    expect(processStepServiceMock.createProcessStep).toHaveBeenCalledWith(givenDto, givenFiles, authenticatedUser.sub);
  });

  it('should delegate readHydrogenComponentsForUnits to the service when the authenticated user requests them', async () => {
    // arrange
    const expectedOverviews: ProcessStepOverviewDto[] = [BottlingOverviewDtoFixture.create()];

    processStepServiceMock.readHydrogenComponentsForOwnUnits.mockResolvedValue(expectedOverviews);

    // act
    const actualResult = await controller.readHydrogenComponentsForUnits(authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedOverviews);
    expect(processStepServiceMock.readHydrogenComponentsForOwnUnits).toHaveBeenCalledWith(authenticatedUser.sub);
  });

  it('should delegate readDigitalProductPassport to the service when a transportation id is provided', async () => {
    // arrange
    const expectedPassport: DigitalProductPassportDto = DigitalProductPassportDtoFixture.create({ id: 'dpp-1' });

    processStepServiceMock.readDigitalProductPassport.mockResolvedValue(expectedPassport);

    // act
    const actualResult = await controller.readDigitalProductPassport(expectedPassport.id);

    // assert
    expect(actualResult).toEqual(expectedPassport);
    expect(processStepServiceMock.readDigitalProductPassport).toHaveBeenCalledWith(expectedPassport.id);
  });

  it('should mark the digital product passport endpoint as public when reading its metadata', () => {
    // act
    const actualResult = Reflect.getMetadata(META_PUBLIC, ProcessStepController.prototype.readDigitalProductPassport);

    // assert
    expect(actualResult).toBe(true);
  });

  it('should return the process step activity for the authenticated user', async () => {
    // arrange
    const givenUser = {
      sub: 'user-1',
    } as AuthenticatedKCUser;

    const expectedActivity = [
      {
        processStepId: 'process-step-1',
        batchId: 'batch-1',
        amount: 10,
        createdAt: new Date('2026-10-14T10:00:00.000Z'),
        processType: ProcessType.HYDROGEN_STORAGE,
        rfnboType: RfnboType.RFNBO_READY,
        ownerName: 'Hydrogen Solutions GmbH',
        ownershipStatus: ProcessStepOwnershipStatus.OWNED,
      } as ProcessStepActivityDto,
    ];

    processStepServiceMock.readProcessStepActivity.mockResolvedValue(expectedActivity);

    // act
    const actualResult = await controller.readProcessStepActivity(givenUser);

    // assert
    expect(processStepServiceMock.readProcessStepActivity).toHaveBeenCalledWith(givenUser.sub);
    expect(actualResult).toEqual(expectedActivity);
  });
});
