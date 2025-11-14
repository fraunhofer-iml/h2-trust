/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { BrokerQueues, LineageContextEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessLineageService } from './process-lineage.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LineageContextService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly traversal: ProcessLineageService,
  ) { }

  private readonly strategies: Record<ProcessType, (root: ProcessStepEntity) => Promise<LineageContextEntity>> = {
    [ProcessType.POWER_PRODUCTION]: async (root) => {
      return new LineageContextEntity(root, undefined, [], [], [root]);
    },

    [ProcessType.WATER_CONSUMPTION]: async (root) => {
      return new LineageContextEntity(root, undefined, [], [root], []);
    },

    [ProcessType.HYDROGEN_PRODUCTION]: async (root) => {
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps([root]);
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps([root]);
      return new LineageContextEntity(root, undefined, [root], waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_BOTTLING]: async (root) => {
      const hydrogenProductions = await this.traversal.fetchHydrogenProductionProcessSteps(root);
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps(hydrogenProductions);
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps(hydrogenProductions);
      return new LineageContextEntity(root, root, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: async (root) => {
      const hydrogenBottling = await this.traversal.fetchHydrogenBottlingProcessStep(root);
      const hydrogenProductions = await this.traversal.fetchHydrogenProductionProcessSteps(hydrogenBottling);
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps(hydrogenProductions);
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps(hydrogenProductions);
      return new LineageContextEntity(root, hydrogenBottling, hydrogenProductions, waterConsumptions, powerProductions);
    },
  };

  async build(processStepId: string): Promise<LineageContextEntity> {
    if (!processStepId) {
      throw new Error('Process step ID must be provided to build lineage context.');
    }

    const root: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );

    if (!root || !root.type) {
      throw new Error('Invalid process step.');
    }

    const executeStrategy = this.strategies[root.type as ProcessType];

    if (!executeStrategy) {
      throw new Error(`Unsupported process type [${root.type}] for lineage context build.`);
    }

    return executeStrategy(root);
  }
}
