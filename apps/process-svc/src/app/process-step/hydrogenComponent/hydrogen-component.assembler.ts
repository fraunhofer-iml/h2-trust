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
import { BatchType, ProcessType, RfnboType } from '@h2-trust/domain';

export class HydrogenComponentAssembler {
  /**
   * Retrieves the batches of the predecessor of a BOTTLING or TRANSPORTATION or the batch of a PRODUCTION. Converts these into HydrogenComponents, then combines them into HydrogenComponents with the same RFNBO status and changes their amount to the proportion of the amount to be filled.
   * @param processStep
   * @returns
   */
  static assemble(processStep: ProcessStepEntity): HydrogenComponentEntity[] {
    if (!processStep || !processStep.batch) {
      const errorMessage =
        'The provided bottling process step is missing (undefined or null) or does not have a batch.';
      throw Error(errorMessage);
    } else if (
      processStep.type == ProcessType.HYDROGEN_BOTTLING ||
      processStep.type == ProcessType.HYDROGEN_TRANSPORTATION
    ) {
      return this.assembleForBottlingAndTransportation(processStep);
    } else if (processStep.type == ProcessType.HYDROGEN_PRODUCTION) {
      return this.assembleForHydrogenProduction(processStep);
    } else {
      const errorMessage = `The specified process step ${processStep.id} is neither HYDROGEN_BOTTLING, HYDROGEN_TRANSPORTATION nor HYDROGEN_PRODUCTION, but of type ${processStep.type}`;
      throw Error(errorMessage);
    }
  }

  private static assembleForBottlingAndTransportation(processStep: ProcessStepEntity): HydrogenComponentEntity[] {
    if (processStep.batch.predecessors?.length === 0) {
      const errorMessage = `ProcessStep ${processStep.id} does not have predecessors.`;
      throw Error(errorMessage);
    }

    const predecessorHydrogenComponents = processStep.batch.predecessors.map(
      HydrogenComponentAssembler.createHydrogenComponentFromBatch,
    );

    return HydrogenCompositionUtil.computeHydrogenComposition(predecessorHydrogenComponents, processStep.batch.amount);
  }

  /**
   * If the type of the process step is Hydrogen Production, we can not use the assemble function because this only works for Bottlings and Transportations.
   * @param processStep
   * @returns
   */
  private static assembleForHydrogenProduction(processStep: ProcessStepEntity): HydrogenComponentEntity[] {
    if (processStep.type != ProcessType.HYDROGEN_PRODUCTION) {
      const errorMessage = `The specified process step is not of type HYDROGEN_PRODUCTION, but of type ${processStep.type}`;
      throw Error(errorMessage);
    }

    if (!processStep.batch) {
      const errorMessage = `ProcessStep ${processStep.id} does not have a batch.`;
      throw Error(errorMessage);
    }

    //Since the processStep is a Hydrogen Production its predecessors are WATER and POWER and therefore its batch is the only batch we have to take in account here.
    const batchHydrogenComponent: HydrogenComponentEntity = HydrogenComponentAssembler.createHydrogenComponentFromBatch(
      processStep.batch,
    );

    return HydrogenCompositionUtil.computeHydrogenComposition([batchHydrogenComponent], processStep.batch.amount);
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
      batch.qualityDetails.rfnboType ?? RfnboType.NOT_SPECIFIED,
    );
  }
}
