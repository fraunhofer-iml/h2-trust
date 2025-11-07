/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {firstValueFrom} from 'rxjs';
import {Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {BrokerQueues, ProcessStepEntity, SustainabilityMessagePatterns,} from '@h2-trust/amqp';
import {EmissionCalculationDto, WaterBatchDto} from '@h2-trust/api';
import {toEmissionDto} from '../emission-dto.builder';
import {ProofOfOriginDtoAssembler} from '../proof-of-origin-dto.assembler';

@Injectable()
export class WaterBatchService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processClient: ClientProxy,
  ) {
  }

  async buildWaterBatches(
    waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<WaterBatchDto[]> {
    if (waterConsumptionProcessSteps.length === 0) {
      return [];
    }
    const waterBatches: WaterBatchDto[] = [];

    for (const waterConsumptionProcessStep of waterConsumptionProcessSteps) {
      const emissionCalculation: EmissionCalculationDto = await firstValueFrom(
        this.processClient.send(SustainabilityMessagePatterns.COMPUTE_WATER_FOR_STEP, {processStep: waterConsumptionProcessStep}),
      );
      const h2KgEquivalentToWaterBatch = waterConsumptionProcessStep.batch.successors[0].amount;
      const emission = toEmissionDto(emissionCalculation, h2KgEquivalentToWaterBatch);

      const waterBatch = ProofOfOriginDtoAssembler.assembleWaterBatchDto(waterConsumptionProcessStep, emission);
      waterBatches.push(waterBatch);
    }

    return waterBatches;
  }
}
