/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BatchEntity,
  BrokerQueues,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadByIdPayload,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';

@Injectable()
export class TraversalService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  async fetchPowerProductionsFromHydrogenProductions(
    hydrogenProductions: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    return this.fetchPredecessorProcessStepsFromHydrogenProductions(hydrogenProductions, ProcessType.POWER_PRODUCTION);
  }

  async fetchWaterConsumptionsFromHydrogenProductions(
    hydrogenProductions: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    return this.fetchPredecessorProcessStepsFromHydrogenProductions(hydrogenProductions, ProcessType.WATER_CONSUMPTION);
  }

  private async fetchPredecessorProcessStepsFromHydrogenProductions(
    hydrogenProductions: ProcessStepEntity[],
    targetType: ProcessType,
  ): Promise<ProcessStepEntity[]> {
    this.assertAllProcessStepsOfType(hydrogenProductions, ProcessType.HYDROGEN_PRODUCTION);

    const collectedProcessSteps = new Map<string, ProcessStepEntity>();
    let currentLayer = hydrogenProductions;

    // Due to split batches, we may have multiple layers of HYDROGEN_PRODUCTION process steps
    while (currentLayer.length > 0) {
      currentLayer
        .filter((processStep) => processStep.type === targetType)
        .forEach((processStep) => collectedProcessSteps.set(processStep.id, processStep));

      const hydrogenProductions = currentLayer.filter(
        (processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION,
      );

      if (hydrogenProductions.length === 0) {
        break;
      }

      const predecessorBatches = hydrogenProductions.flatMap(this.getPredecessorBatches);
      currentLayer = await this.fetchProcessStepsOfBatches(predecessorBatches);
    }

    return Array.from(collectedProcessSteps.values());
  }

  async fetchHydrogenProductionsFromHydrogenBottling(
    hydrogenBottling: ProcessStepEntity,
  ): Promise<ProcessStepEntity[]> {
    return this.fetchPredecessorProcessSteps(
      hydrogenBottling,
      ProcessType.HYDROGEN_BOTTLING,
      ProcessType.HYDROGEN_PRODUCTION,
    );
  }

  async fetchHydrogenBottlingFromHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
  ): Promise<ProcessStepEntity> {
    const hydrogenBottlings: ProcessStepEntity[] = await this.fetchPredecessorProcessSteps(
      hydrogenTransportation,
      ProcessType.HYDROGEN_TRANSPORTATION,
      ProcessType.HYDROGEN_BOTTLING,
    );

    if (hydrogenBottlings?.length !== 1) {
      throw new Error(
        `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [${hydrogenBottlings?.length}].`,
      );
    }

    return hydrogenBottlings[0];
  }

  private async fetchPredecessorProcessSteps(
    processStep: ProcessStepEntity,
    expectedProcessType: ProcessType,
    predecessorProcessType: ProcessType,
  ): Promise<ProcessStepEntity[]> {
    this.assertAllProcessStepsOfType([processStep], expectedProcessType);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatches(processStep);
    const processStepsOfPredecessorBatches: ProcessStepEntity[] =
      await this.fetchProcessStepsOfBatches(predecessorBatches);
    this.assertAllProcessStepsOfType(processStepsOfPredecessorBatches, predecessorProcessType);

    if (!processStepsOfPredecessorBatches || processStepsOfPredecessorBatches.length !== predecessorBatches.length) {
      throw new Error(
        `Number of process steps must be [${predecessorBatches.length}], but found [${processStepsOfPredecessorBatches?.length ?? 0}].`,
      );
    }

    return processStepsOfPredecessorBatches;
  }

  private getPredecessorBatches(processStep: ProcessStepEntity): BatchEntity[] {
    const predecessorBatches: BatchEntity[] = processStep.batch?.predecessors;

    if (!Array.isArray(predecessorBatches) || predecessorBatches.length === 0) {
      throw new Error(`No predecessors found for process step [${processStep.id}]`);
    }

    return predecessorBatches;
  }

  private async fetchProcessStepsOfBatches(batches: BatchEntity[]): Promise<ProcessStepEntity[]> {
    const promises = batches.map(({ processStepId }) =>
      firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, ReadByIdPayload.of(processStepId))),
    );
    return Promise.all(promises);
  }

  private assertAllProcessStepsOfType(processSteps: ProcessStepEntity[], expectedProcessType: ProcessType): void {
    if (!processSteps || processSteps.length === 0 || processSteps.some((processStep) => !processStep)) {
      throw new Error(`Process steps of type [${expectedProcessType}] are missing.`);
    }

    const invalidProcessSteps = processSteps
      .filter((processStep) => processStep.type !== expectedProcessType)
      .map((processStep) => `${processStep.id} (${processStep.type})`);

    if (invalidProcessSteps.length > 0) {
      throw new Error(
        `All process steps must be of type [${expectedProcessType}], but found invalid types: ${invalidProcessSteps.join(', ')}`,
      );
    }
  }
}
