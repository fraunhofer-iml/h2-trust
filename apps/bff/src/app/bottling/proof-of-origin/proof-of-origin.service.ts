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
import { BrokerQueues, LineageMessagePatterns } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProofOfOriginAssembler } from './proof-of-origin.assembler';

@Injectable()
export class ProofOfOriginService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly assembler: ProofOfOriginAssembler,
  ) {}

  async readProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const context = await firstValueFrom(this.processSvc.send(LineageMessagePatterns.BUILD_CONTEXT, { processStepId }));
    return this.assembler.build(context);
  }
}
