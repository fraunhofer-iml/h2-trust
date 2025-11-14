/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerQueues, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProcessStepTraversalService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) { }

  async fetchPowerProductionsFromHydrogenProductions(hydrogenProductions: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return this.traverseFromHydrogenProductions(hydrogenProductions, ProcessType.POWER_PRODUCTION);
  }

  async fetchWaterConsumptionsFromHydrogenProductions(hydrogenProductions: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return this.traverseFromHydrogenProductions(hydrogenProductions, ProcessType.WATER_CONSUMPTION);
  }

  private async traverseFromHydrogenProductions(hydrogenProductions: ProcessStepEntity[], targetType: ProcessType): Promise<ProcessStepEntity[]> {
    if (!hydrogenProductions || hydrogenProductions.length === 0) {
      throw new Error(`Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`);
    }

    this.assertProcessType(hydrogenProductions, ProcessType.HYDROGEN_PRODUCTION);

    const collectedProcessSteps = new Map<string, ProcessStepEntity>();
    let currentLayer = hydrogenProductions;

    // Due to split batches, we may have multiple layers of HYDROGEN_PRODUCTION process steps
    while (currentLayer.length > 0) {
      currentLayer
        .filter((processStep) => processStep.type === targetType)
        .forEach((processStep) => collectedProcessSteps.set(processStep.id, processStep));

      const hydrogenProductions = currentLayer.filter((processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION)

      if (hydrogenProductions.length === 0) {
        break
      };

      const predecessorBatches = hydrogenProductions.flatMap(this.getPredecessorBatchesOrThrow);
      currentLayer = await this.fetchProcessStepsOfBatches(predecessorBatches);
    }

    return Array.from(collectedProcessSteps.values());
  }

  async fetchHydrogenProductionsFromHydrogenBottling(hydrogenBottling: ProcessStepEntity): Promise<ProcessStepEntity[]> {
    if (!hydrogenBottling) {
      throw new Error(`Process step of type [${ProcessType.HYDROGEN_BOTTLING}] is missing.`);
    }

    this.assertProcessType([hydrogenBottling], ProcessType.HYDROGEN_BOTTLING);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(hydrogenBottling);
    const processStepsOfPredecessorBatches: ProcessStepEntity[] = await this.fetchProcessStepsOfBatches(predecessorBatches);
    this.assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_PRODUCTION);
    this.assertNumberOfProcessSteps(processStepsOfPredecessorBatches, predecessorBatches.length);

    return processStepsOfPredecessorBatches;
  }

  async fetchHydrogenBottlingFromHydrogenTransportation(hydrogenTransportation: ProcessStepEntity): Promise<ProcessStepEntity> {
    if (!hydrogenTransportation) {
      throw new Error(`Process step of type [${ProcessType.HYDROGEN_TRANSPORTATION}] is missing.`);
    }

    this.assertProcessType([hydrogenTransportation], ProcessType.HYDROGEN_TRANSPORTATION);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(hydrogenTransportation);
    const processStepsOfPredecessorBatches: ProcessStepEntity[] = await this.fetchProcessStepsOfBatches(predecessorBatches);
    this.assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_BOTTLING);
    this.assertNumberOfProcessSteps(processStepsOfPredecessorBatches, 1);

    return processStepsOfPredecessorBatches[0];
  }

  private getPredecessorBatchesOrThrow(processStep: ProcessStepEntity): BatchEntity[] {
    const predecessorBatches: BatchEntity[] = processStep.batch?.predecessors;

    if (!Array.isArray(predecessorBatches) || predecessorBatches.length === 0) {
      throw new Error(`No predecessors found for process step [${processStep.id}]`);
    }

    return predecessorBatches;
  }

  private async fetchProcessStepsOfBatches(batches: BatchEntity[]): Promise<ProcessStepEntity[]> {
    const promises = batches.map(({ processStepId }) => firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId })));
    return Promise.all(promises);
  }

  private assertProcessType(processSteps: ProcessStepEntity[], expectedProcessType: ProcessType): void {
    const invalidProcessSteps: ProcessStepEntity[] = processSteps.filter(
      (processStep) => processStep.type !== expectedProcessType,
    );

    if (invalidProcessSteps.length > 0) {
      const invalidProcessTypes = invalidProcessSteps
        .map((processStep) => [processStep.id, processStep.type].join(' '))
        .join(', ');
      throw new Error(`All process steps must be of type [${expectedProcessType}], but found [${invalidProcessTypes}]`);
    }
  }

  private assertNumberOfProcessSteps(processSteps: ProcessStepEntity[], expectedNumberOfProcessSteps: number): void {
    if (!processSteps || processSteps.length !== expectedNumberOfProcessSteps) {
      const errorMessage = `Number of process steps must be [${expectedNumberOfProcessSteps}], but found [${processSteps?.length ?? 0}].`;
      throw new Error(errorMessage);
    }
  }
}
