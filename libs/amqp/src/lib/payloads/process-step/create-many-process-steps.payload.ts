/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { ProcessStepEntity } from '../../entities';

/*
 * This payload wraps the ProcessStepEntity domain objects rather than raw creation parameters.
 * The business logic for constructing ProcessStepEntities resides in process-svc (ProductionService),
 * while batch-svc is responsible only for persistence. This separation keeps domain logic
 * in process-svc and database operations in batch-svc.
 */
export class CreateManyProcessStepsPayload {
  @ArrayNotEmpty()
  @IsNotEmpty()
  @Type(() => ProcessStepEntity)
  processSteps: ProcessStepEntity[];

  constructor(processSteps: ProcessStepEntity[]) {
    this.processSteps = processSteps;
  }
}
