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

  it('delegates findAll to CompanyService', async () => {
    const companies = [CompanyDtoFixture.create(), CompanyDtoFixture.createHydrogenProducer()];

    companyServiceMock.findAll.mockResolvedValue(companies);

    await expect(controller.findAll()).resolves.toEqual(companies);
    expect(companyServiceMock.findAll).toHaveBeenCalledWith();
  });
});