/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HydrogenComponentEntity, PaginatedProcessStepEntity, ProcessStepEntity } from '@h2-trust/contracts/entities';
import {
  CreateProcessStepPayload,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadPaginatedProcessStepsPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ReadProcessStepsByUnitsPayload,
} from '@h2-trust/contracts/payloads';
import { ProcessStepMessagePatterns } from '@h2-trust/messaging';
import { ProcessStepService } from './process-step.service';

@Controller()
export class ProcessStepController {
  constructor(private readonly processStepService: ProcessStepService) {}

  @MessagePattern(ProcessStepMessagePatterns.CREATE_PROCESS_STEP)
  createGenericProcessStep(payload: CreateProcessStepPayload): Promise<ProcessStepEntity> {
    return this.processStepService.createProcessStep(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER)
  readProcessStepsByTypesAndActiveAndOwner(
    payload: ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessStepsByTypesAndActiveAndOwner(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL_BY_UNITS)
  readProcessStepsByUnit(payload: ReadProcessStepsByUnitsPayload): Promise<HydrogenComponentEntity[]> {
    return this.processStepService.readAllHydrogenComponentsFromUnits(payload.unitIds);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_PRODUCTION_PAGINATION)
  readProcessStepsByPredecessorTypesAndOwner(
    payload: ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ): Promise<PaginatedProcessStepEntity> {
    return this.processStepService.readPaginatedProductions(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_PROCESS_STEP_PAGINATION)
  readProcessStepsByFilter(payload: ReadPaginatedProcessStepsPayload): Promise<PaginatedProcessStepEntity> {
    return this.processStepService.readPaginatedProcessSteps(payload);
  }
}
