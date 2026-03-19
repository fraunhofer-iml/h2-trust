/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  BottlingMessagePatterns,
  CreateHydrogenBottlingPayload,
  ProcessStepEntity,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/amqp';
import { BottlingService } from './bottling.service';

@Controller()
export class BottlingController {
  constructor(private readonly bottlingService: BottlingService) {}

  @MessagePattern(BottlingMessagePatterns.CREATE_HYDROGEN_BOTTLING)
  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    return this.bottlingService.createHydrogenBottlingProcessStep(payload);
  }

  @MessagePattern(BottlingMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER)
  async readBottlingsAndTransportationsByOwner(
    payload: ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.bottlingService.readProcessStepsByTypesAndActiveAndOwner(payload);
  }
}
