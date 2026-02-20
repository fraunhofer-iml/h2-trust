/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import {
  BatchEntity,
  BrokerException,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  ProcessStepEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType, RFNBOType } from '@h2-trust/domain';

export class HydrogenComponentAssembler {
  static assemble(processStep: ProcessStepEntity): HydrogenComponentEntity[] {
    this.validateProcessStep(processStep);

    const predecessorHydrogenComponents = processStep.batch.predecessors.map(
      HydrogenComponentAssembler.createHydrogenComponentFromBatch,
    );

    return HydrogenCompositionUtil.computeHydrogenComposition(predecessorHydrogenComponents, processStep.batch.amount);
  }

  private static validateProcessStep(processStep: ProcessStepEntity): void {
    if (!processStep) {
      const errorMessage = 'The provided bottling process step is missing (undefined or null).';
      throw Error(errorMessage);
    }

    if (processStep.type != ProcessType.HYDROGEN_BOTTLING && processStep.type != ProcessType.HYDROGEN_TRANSPORTATION) {
      const errorMessage = `ProcessStep ${processStep.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${processStep.type}.`;
      throw Error(errorMessage);
    }

    if (!processStep.batch) {
      const errorMessage = `ProcessStep ${processStep.id} does not have a batch.`;
      throw Error(errorMessage);
    }

    if (processStep.batch.predecessors?.length === 0) {
      const errorMessage = `ProcessStep ${processStep.id} does not have predecessors.`;
      throw Error(errorMessage);
    }
  }

  private static createHydrogenComponentFromBatch(batch: BatchEntity): HydrogenComponentEntity {
    if (batch.type !== BatchType.HYDROGEN) {
      const errorMessage = `Predecessor batch ${batch.id} should be type ${BatchType.HYDROGEN}, but is ${batch.type}.`;
      throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    return new HydrogenComponentEntity(
      '',
      batch.qualityDetails?.color,
      batch.amount,
      batch.rfnboType ?? RFNBOType.NOT_SPECIFIED,
    );
  }
}
