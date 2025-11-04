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
import {
  BrokerQueues,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  SustainabilityMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, EmissionCalculationDto, EmissionDto, SectionDto } from '@h2-trust/api';
import { ProofOfOrigin } from '@h2-trust/domain';
import { toEmissionDto } from '../emission-dto.builder';
import { ProofOfOriginDtoAssembler } from '../proof-of-origin-dto.assembler';

@Injectable()
export class HydrogenTransportationSectionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
  ) {}

  async buildHydrogenTransportationSection(
    hydrogenTransportationProcessStep: ProcessStepEntity,
    hydrogenBottlingProcessStep: ProcessStepEntity,
  ): Promise<SectionDto> {
    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, hydrogenBottlingProcessStep.id),
    );

    const emissionCalculation: EmissionCalculationDto = await firstValueFrom(
      this.processSvc.send(SustainabilityMessagePatterns.COMPUTE_CUMULATIVE_FOR_STEP, {
        processStepId: hydrogenTransportationProcessStep.id,
        emissionCalculationName: 'transport',
      }),
    );

    const emission: EmissionDto = toEmissionDto(emissionCalculation, hydrogenTransportationProcessStep.batch.amount);

    const batch: BatchDto = ProofOfOriginDtoAssembler.assembleBottlingOrTransportationHydrogenBatchDto(
      hydrogenTransportationProcessStep,
      hydrogenComposition,
      emission,
    );

    return new SectionDto(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION_NAME, [batch], []);
  }
}
