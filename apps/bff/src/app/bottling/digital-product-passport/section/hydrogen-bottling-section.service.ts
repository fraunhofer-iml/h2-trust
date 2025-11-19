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
} from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionDto, HydrogenBatchDto, SectionDto } from '@h2-trust/api';
import { ProofOfOrigin } from '@h2-trust/domain';
import { EmissionComputationService } from '../emission/emission.service';
import { BatchAssembler } from '../assembler/batch.assembler';
import { EmissionCalculationAssembler } from '../emission/emission.assembler';

@Injectable()
export class HydrogenBottlingSectionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    private readonly emissionCalculatorService: EmissionComputationService,
  ) { }

  async buildSection(hydrogenBottling: ProcessStepEntity): Promise<SectionDto> {
    const hydrogenCompositions: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, hydrogenBottling.id),
    );

    const emissionCalculation: EmissionCalculationDto = await this.emissionCalculatorService.computeCumulativeEmissions(hydrogenBottling.id, 'bottling');
    const hydrogenKgEquivalent: number = hydrogenBottling.batch.amount;
    const emission: EmissionDto = EmissionCalculationAssembler.assembleEmissionDto(emissionCalculation, hydrogenKgEquivalent);
    const batch: HydrogenBatchDto = BatchAssembler.assembleHydrogenBottlingBatchDto(hydrogenBottling, hydrogenCompositions, emission);
    return new SectionDto(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], []);
  }
}
