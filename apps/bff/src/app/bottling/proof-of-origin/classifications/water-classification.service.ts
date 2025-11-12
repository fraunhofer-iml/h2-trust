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
import {ClassificationDto, EmissionCalculationDto, WaterBatchDto,} from '@h2-trust/api';
import {BatchType, MeasurementUnit, ProofOfOrigin} from "@h2-trust/domain";
import {toEmissionDto} from "../emission-dto.builder";
import {ProofOfOriginDtoAssembler} from "../proof-of-origin-dto.assembler";

@Injectable()
export class WaterClassificationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processClient: ClientProxy,
  ) {
  }

  async buildWaterClassification(
    waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto> {
    if (!waterConsumptionProcessSteps?.length) {
      const message = 'No water consumption process steps found';
      throw new Error(message);
    }

    const waterBatches = await this.buildWaterBatches(waterConsumptionProcessSteps);

    return ProofOfOriginDtoAssembler.assembleClassification(
      ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION_NAME,
      MeasurementUnit.WATER,
      BatchType.WATER,
      waterBatches,
      [],
    );
  }

  private async buildWaterBatches(
    waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<WaterBatchDto[]> {
    return await Promise.all(
      waterConsumptionProcessSteps.map(async (waterConsumptionProcessStep) => {
        const emissionCalculation: EmissionCalculationDto = await firstValueFrom(
          this.processClient.send(
            SustainabilityMessagePatterns.COMPUTE_WATER_FOR_STEP,
            {processStep: waterConsumptionProcessStep},
          ),
        );

        const h2KgEquivalentToWaterBatch = waterConsumptionProcessStep.batch.successors[0].amount;
        const emission = toEmissionDto(emissionCalculation, h2KgEquivalentToWaterBatch);

        return ProofOfOriginDtoAssembler.assembleWaterBatchDto(waterConsumptionProcessStep, emission);
      }),
    );
  }
}
