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
import { parseColor, ProcessType } from '@h2-trust/api';
import { BatchTypeDbEnum } from '@h2-trust/database';

export class HydrogenComponentAssembler {
  static assembleFromBottlingProcessStep(bottlingProcessStep: ProcessStepEntity): HydrogenComponentEntity[] {
    this.validateProcessStep(bottlingProcessStep);

    const predecessorHydrogenComponents = bottlingProcessStep.batch.predecessors.map(
      HydrogenComponentAssembler.createHydrogenComponentFromBatch,
    );

    return HydrogenCompositionUtil.computeHydrogenComposition(
      predecessorHydrogenComponents,
      bottlingProcessStep.batch.amount,
    );
  }

  private static validateProcessStep(bottlingProcessStep: ProcessStepEntity): void {
    if (!bottlingProcessStep) {
      const errorMessage = 'The provided bottling process step is missing (undefined or null).';
      throw Error(errorMessage);
    }

    if (
      bottlingProcessStep.processType != ProcessType.HYDROGEN_BOTTLING &&
      bottlingProcessStep.processType != ProcessType.HYDROGEN_TRANSPORTATION
    ) {
      const errorMessage = `ProcessStep ${bottlingProcessStep.id} should be type ${ProcessType.HYDROGEN_BOTTLING} or ${ProcessType.HYDROGEN_TRANSPORTATION}, but is ${bottlingProcessStep.processType}.`;
      throw Error(errorMessage);
    }

    if (!bottlingProcessStep.batch) {
      const errorMessage = `ProcessStep ${bottlingProcessStep.id} does not have a batch.`;
      throw Error(errorMessage);
    }

    if (bottlingProcessStep.batch.predecessors?.length === 0) {
      const errorMessage = `ProcessStep ${bottlingProcessStep.id} does not have predecessors.`;
      throw Error(errorMessage);
    }
  }

  private static createHydrogenComponentFromBatch(batch: BatchEntity): HydrogenComponentEntity {
    if (batch.type !== BatchTypeDbEnum.HYDROGEN) {
      const errorMessage = `Predecessor batch ${batch.id} should be type ${BatchTypeDbEnum.HYDROGEN}, but is ${batch.type}.`;
      throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    return new HydrogenComponentEntity(parseColor(batch.quality), batch.amount);
  }
}
