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
  ProvenanceEntity,
  ProvenanceMessagePatterns,
} from '@h2-trust/amqp';
import { EmissionComputationResultDto, ProofOfSustainabilityDto } from '@h2-trust/api';
import { EmissionCalculatorService } from '../emission/emission-calculator.service';

@Injectable()
export class ProofOfSustainabilityService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly emissionCalculatorService: EmissionCalculatorService) { }

  async readProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityDto> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }),
    );
    const emissionComputationResult: EmissionComputationResultDto = await this.emissionCalculatorService.computeForProvenance(provenance);

    return {
      batchId: provenance.root.id,
      amountCO2PerMJH2: emissionComputationResult.amountCO2PerMJH2,
      emissionReductionPercentage: emissionComputationResult.emissionReductionPercentage,
      calculations: emissionComputationResult.calculations,
      processStepEmissions: emissionComputationResult.processStepEmissions,
    };
  }
}
