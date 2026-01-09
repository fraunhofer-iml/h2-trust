/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, CompanyMessagePatterns } from '@h2-trust/amqp';
import { CompanyDto } from '@h2-trust/api';

@Injectable()
export class CompanyService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async findAll(): Promise<CompanyDto[]> {
    const companies = await firstValueFrom(this.generalService.send(CompanyMessagePatterns.READ_ALL, {}));
    return companies.map(CompanyDto.fromEntity);
  }
}
