/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerQueues, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProcessStepTraversalService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) { }

  async fetchPowerProductionProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return this.fetchProcessStepsDownFromHydrogenProduction(processSteps, ProcessType.POWER_PRODUCTION);
  }

  async fetchWaterConsumptionProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return this.fetchProcessStepsDownFromHydrogenProduction(processSteps, ProcessType.WATER_CONSUMPTION);
  }

  async fetchProcessStepsDownFromHydrogenProduction(
    processSteps: ProcessStepEntity[],
    questedProcessType: ProcessType,
  ): Promise<ProcessStepEntity[]> {
    if (!processSteps || processSteps.length === 0) {
      throw new HttpException(
        `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.assertProcessType(processSteps, ProcessType.HYDROGEN_PRODUCTION);

    // Start with the first layer HYDROGEN_PRODUCTION -> due to split batches, we may have multiple layers of predecessors
    let currentProcessStepLayer: ProcessStepEntity[] = processSteps;

    // Collect all quested process steps across all layers
    const questedProcessStepsById = new Map<string, ProcessStepEntity>();

    while (currentProcessStepLayer.length > 0) {
      const questedProcessSteps = currentProcessStepLayer.filter(
        (processSteps) => processSteps.type === questedProcessType,
      );

      // Collect quested process steps of the current layer
      for (const questedProcessStep of questedProcessSteps) {
        questedProcessStepsById.set(questedProcessStep.id, questedProcessStep);
      }

      const hydrogenProductionProcessSteps = currentProcessStepLayer.filter(
        (processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION,
      );

      // If there are no HYDROGEN_PRODUCTION process steps left in the current layer, we are done
      if (hydrogenProductionProcessSteps.length === 0) {
        break;
      }

      const predecessorBatches = hydrogenProductionProcessSteps.flatMap((processStep) =>
        this.getPredecessorBatchesOrThrow(processStep),
      );
      currentProcessStepLayer = await this.fetchProcessStepsOfBatches(predecessorBatches);
    }

    return Array.from(questedProcessStepsById.values());
  }

  async fetchHydrogenProductionProcessSteps(processStep: ProcessStepEntity): Promise<ProcessStepEntity[]> {
    if (!processStep) {
      throw new HttpException(
        `Process step of type [${ProcessType.HYDROGEN_BOTTLING}] is missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.assertProcessType([processStep], ProcessType.HYDROGEN_BOTTLING);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(processStep);
    const processStepsOfPredecessorBatches =
      await this.fetchProcessStepsOfBatches(predecessorBatches);
    this.assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_PRODUCTION);
    this.assertNumberOfProcessSteps(processStepsOfPredecessorBatches, predecessorBatches.length);

    return processStepsOfPredecessorBatches;
  }

  async fetchHydrogenBottlingProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    if (!processStep) {
      throw new HttpException(
        `Process step of type [${ProcessType.HYDROGEN_TRANSPORTATION}] is missing.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.assertProcessType([processStep], ProcessType.HYDROGEN_TRANSPORTATION);

    const predecessorBatches: BatchEntity[] = this.getPredecessorBatchesOrThrow(processStep);
    const processStepsOfPredecessorBatches: ProcessStepEntity[] =
      await this.fetchProcessStepsOfBatches(predecessorBatches);
    this.assertProcessType(processStepsOfPredecessorBatches, ProcessType.HYDROGEN_BOTTLING);
    this.assertNumberOfProcessSteps(processStepsOfPredecessorBatches, 1);

    return processStepsOfPredecessorBatches[0];
  }

  private getPredecessorBatchesOrThrow(processStep: ProcessStepEntity): BatchEntity[] {
    const predecessorBatches: BatchEntity[] = processStep.batch?.predecessors;
    if (!Array.isArray(predecessorBatches) || predecessorBatches.length === 0) {
      const errorMessage = `No further predecessors could be found for process step(s) with ID ${processStep.id}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
    return predecessorBatches;
  }

  private assertNumberOfProcessSteps(processSteps: ProcessStepEntity[], expectedNumberOfProcessSteps: number): void {
    if (!processSteps || processSteps.length !== expectedNumberOfProcessSteps) {
      const errorMessage = `Number of process steps must be exactly ${expectedNumberOfProcessSteps}, but found ${processSteps?.length ?? 0}.`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  private assertProcessType(processSteps: ProcessStepEntity[], expectedProcessType: ProcessType): void {
    const invalidProcessSteps: ProcessStepEntity[] = processSteps.filter(
      (processStep) => processStep.type !== expectedProcessType,
    );

    if (invalidProcessSteps.length > 0) {
      const invalidProcessTypes = invalidProcessSteps
        .map((processStep) => [processStep.id, processStep.type].join(' '))
        .join(', ');
      const errorMessage = `All process steps must be of type ${expectedProcessType}, but found invalid process types: ${invalidProcessTypes}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async fetchProcessStepsOfBatches(batches: BatchEntity[]): Promise<ProcessStepEntity[]> {
    const promises = batches.map(({ processStepId }) => firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId })));
    return Promise.all(promises);
  }
}
