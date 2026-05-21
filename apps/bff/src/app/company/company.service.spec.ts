/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { CompanyDto } from '@h2-trust/contracts/dtos';
import { CompanyEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CompanyMessagePatterns } from '@h2-trust/messaging';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;

  const generalServiceMock = {
    send: jest.fn(),
  };

  beforeEach(() => {
    service = new CompanyService(generalServiceMock as unknown as ClientProxy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should request all companies and map the response to DTOs when finding all companies', async () => {
    // arrange
    const expectedCompanies = [
      CompanyEntityFixture.createPowerProducer({ id: 'company-1' }),
      CompanyEntityFixture.createHydrogenProducer({ id: 'company-2' }),
      CompanyEntityFixture.createPowerProducer({ id: 'company-3', name: 'Second Power Company' }),
    ];

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedCompanies));

    // act
    const actualResult: CompanyDto[] = await service.findAll();

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(CompanyMessagePatterns.READ, {});
    expect(actualResult).toEqual(expectedCompanies.map(CompanyDto.fromEntity));
  });
});