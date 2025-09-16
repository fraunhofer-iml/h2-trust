/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, CompanyMessagePatterns } from '@h2-trust/amqp';
import { CompanyDto, CompanyDtoMock } from '@h2-trust/api';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [CompanyController],
      providers: [
        CompanyService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    clientProxy = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all Companies', async () => {
    const expectedResponse: CompanyDto[] = CompanyDtoMock;
    const sendRequestSpy = jest.spyOn(clientProxy, 'send');

    sendRequestSpy.mockImplementation((_messagePattern: CompanyMessagePatterns, _data: any) => {
      return of(expectedResponse);
    });

    const actualResponse: CompanyDto[] = await controller.findAll();

    expect(actualResponse).toEqual(expectedResponse);
  });
});
