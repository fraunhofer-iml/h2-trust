/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProvenanceEntity, ProcessStepEntity, SustainabilityMessagePatterns } from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto } from '@h2-trust/api';
import { EmissionCalculatorService } from './emission-calculator.service';

@Controller()
export class EmissionController {
  constructor(private readonly service: EmissionCalculatorService) { }

  @MessagePattern(SustainabilityMessagePatterns.COMPUTE_FOR_PROCESS_STEP)
  async computeForProcessStep(
    @Payload() payload: { lineageContext: ProvenanceEntity },
  ): Promise<EmissionComputationResultDto> {
    return this.service.computeForContext(payload.lineageContext);
  }

  @MessagePattern(SustainabilityMessagePatterns.COMPUTE_POWER_FOR_STEP)
  async computePowerForStep(@Payload() payload: { processStep: ProcessStepEntity }): Promise<EmissionCalculationDto> {
    return this.service.computePowerCalculation(payload.processStep);
  }

  @MessagePattern(SustainabilityMessagePatterns.COMPUTE_WATER_FOR_STEP)
  computeWaterForStep(@Payload() payload: { processStep: ProcessStepEntity }): EmissionCalculationDto {
    return this.service.computeWaterCalculation(payload.processStep);
  }

  @MessagePattern(SustainabilityMessagePatterns.COMPUTE_CUMULATIVE_FOR_STEP)
  async computeCumulativeForStep(
    @Payload() payload: { processStepId: string; emissionCalculationName: string },
  ): Promise<EmissionCalculationDto> {
    return this.service.computeForProcessStep(payload.processStepId, payload.emissionCalculationName);
  }
}
