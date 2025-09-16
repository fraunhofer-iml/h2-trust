/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';

export function assertPredecessorsExist(predecessors: BatchEntity[] | undefined, processStepId: string): void {
  if (!Array.isArray(predecessors) || predecessors.length === 0) {
    const errorMessage = `No further predecessors could be found for process step(s) with ID ${processStepId}`;
    throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  }
}

export function assertNumberOfProcessSteps(
  processSteps: ProcessStepEntity[],
  expectedNumberOfProcessSteps: number,
): void {
  if (!processSteps || processSteps.length !== expectedNumberOfProcessSteps) {
    const errorMessage = `Number of process steps must be exactly ${expectedNumberOfProcessSteps}, but found ${processSteps?.length ?? 0}.`;
    throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  }
}

export function assertProcessType(processSteps: ProcessStepEntity[], expectedProcessType: ProcessType): void {
  const invalidProcessSteps: ProcessStepEntity[] = processSteps.filter(
    (processStep) => processStep.processType !== expectedProcessType,
  );

  if (invalidProcessSteps.length > 0) {
    const invalidProcessTypes = invalidProcessSteps
      .map((processStep) => [processStep.id, processStep.processType].join(' '))
      .join(', ');
    const errorMessage = `All process steps must be of type ${expectedProcessType}, but found invalid process types: ${invalidProcessTypes}`;
    throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  }
}

export function invalidProcessType(
  processStepId: string,
  actualProcessType: string,
  expectedProcessType?: string,
): HttpException {
  const errorMessage = expectedProcessType
    ? `ProcessStep with ID ${processStepId} should be of type ${expectedProcessType}, but is ${actualProcessType}`
    : `ProcessStep with ID ${processStepId} has an invalid process type: ${actualProcessType}`;
  return new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
}
