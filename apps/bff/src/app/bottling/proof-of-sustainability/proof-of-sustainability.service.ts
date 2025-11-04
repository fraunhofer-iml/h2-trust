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
  LineageContextEntity,
  LineageMessagePatterns,
  SustainabilityMessagePatterns,
} from '@h2-trust/amqp';
import { EmissionComputationResultDto, ProofOfSustainabilityDto } from '@h2-trust/api';

@Injectable()
export class ProofOfSustainabilityService {
  constructor(@Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy) {}

  async readProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityDto> {
    const context: LineageContextEntity = await firstValueFrom(
      this.processSvc.send(LineageMessagePatterns.BUILD_CONTEXT, { processStepId }),
    );
    const emissionComputationResult: EmissionComputationResultDto = await firstValueFrom(
      this.processSvc.send(SustainabilityMessagePatterns.COMPUTE_FOR_PROCESS_STEP, { lineageContext: context }),
    );

    return {
      batchId: context.root.id,
      amountCO2PerMJH2: emissionComputationResult.amountCO2PerMJH2,
      emissionReductionPercentage: emissionComputationResult.emissionReductionPercentage,
      calculations: emissionComputationResult.calculations,
      processStepEmissions: emissionComputationResult.processStepEmissions,
    };
  }
}
