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
import { BrokerQueues, HydrogenComponentEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

@Injectable()
export class BottlingSectionService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  async buildBottlingSection(processStep: ProcessStepEntity): Promise<SectionDto> {
    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, processStep.id),
    );

    return new SectionDto(
      ProofOfOriginConstants.HYDROGEN_BOTTLING_SECTION_NAME,
      [ProofOfOriginDtoAssembler.assembleBottlingHydrogenBatchDto(processStep, hydrogenComposition)],
      [],
    );
  }

  async buildTransportationSection(
    hydrogenTransportationProcessStep: ProcessStepEntity,
    hydrogenBottlingProcessStep: ProcessStepEntity,
  ): Promise<SectionDto> {
    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, hydrogenBottlingProcessStep.id),
    );

    return new SectionDto(
      ProofOfOriginConstants.HYDROGEN_TRANSPORTATION_SECTION_NAME,
      [
        ProofOfOriginDtoAssembler.assembleBottlingHydrogenBatchDto(
          hydrogenTransportationProcessStep,
          hydrogenComposition,
        ),
      ],
      [],
    );
  }
}
