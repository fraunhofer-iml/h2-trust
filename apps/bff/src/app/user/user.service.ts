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
import { BrokerQueues, ReadByIdPayload, UserMessagePatterns } from '@h2-trust/amqp';
import { UserDetailsDto } from '@h2-trust/api';

@Injectable()
export class UserService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async readUserWithCompany(id: string): Promise<UserDetailsDto> {
    return firstValueFrom(this.generalService.send(UserMessagePatterns.READ, ReadByIdPayload.of(id))).then(
      UserDetailsDto.fromEntity,
    );
  }
}
