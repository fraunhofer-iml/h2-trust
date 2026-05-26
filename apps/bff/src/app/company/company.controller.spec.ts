/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;

  const companyServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    controller = new CompanyController(companyServiceMock as unknown as CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate findAll to CompanyService when handling the companies request', async () => {
    // arrange
    const expectedCompanies = [CompanyDtoFixture.create(), CompanyDtoFixture.createHydrogenProducer()];

    companyServiceMock.findAll.mockResolvedValue(expectedCompanies);

    // act
    const actualResult = await controller.findAll();

    // assert
    expect(actualResult).toEqual(expectedCompanies);
    expect(companyServiceMock.findAll).toHaveBeenCalledWith();
  });
});
