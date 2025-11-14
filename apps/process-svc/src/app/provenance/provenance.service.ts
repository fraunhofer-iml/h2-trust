/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { BrokerQueues, ProvenanceEntity as ProvenanceEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepTraversalService } from './process-step-traversal.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

type ProvenanceBuilderFn = (root: ProcessStepEntity) => Promise<ProvenanceEntity>;

@Injectable()
export class ProvenanceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    private readonly traversal: ProcessStepTraversalService,
  ) { }

  private readonly provenanceBuilders: Record<ProcessType, ProvenanceBuilderFn> = {
    [ProcessType.POWER_PRODUCTION]: async (root) => {
      const powerProductions = [root];
      return new ProvenanceEntity(root, undefined, [], [], powerProductions);
    },

    [ProcessType.WATER_CONSUMPTION]: async (root) => {
      const waterConsumptions = [root];
      return new ProvenanceEntity(root, undefined, [], waterConsumptions, []);
    },

    [ProcessType.HYDROGEN_PRODUCTION]: async (root) => {
      const hydrogenProductions = [root];
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps(hydrogenProductions);
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps(hydrogenProductions);
      return new ProvenanceEntity(root, undefined, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_BOTTLING]: async (root) => {
      const hydrogenProductions = await this.traversal.fetchHydrogenProductionProcessSteps(root);
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps(hydrogenProductions);
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps(hydrogenProductions);
      return new ProvenanceEntity(root, root, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: async (root) => {
      const hydrogenBottling = await this.traversal.fetchHydrogenBottlingProcessStep(root);
      const hydrogenProductions = await this.traversal.fetchHydrogenProductionProcessSteps(hydrogenBottling);
      const waterConsumptions = await this.traversal.fetchWaterConsumptionProcessSteps(hydrogenProductions);
      const powerProductions = await this.traversal.fetchPowerProductionProcessSteps(hydrogenProductions);
      return new ProvenanceEntity(root, hydrogenBottling, hydrogenProductions, waterConsumptions, powerProductions);
    },
  };

  async buildProvenance(processStepId: string): Promise<ProvenanceEntity> {
    if (!processStepId) {
      throw new Error('processStepId must be provided.');
    }

    const root: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );

    if (!root || !root.type) {
      throw new Error('Invalid process step.');
    }

    const provenanceBuilder: ProvenanceBuilderFn = this.provenanceBuilders[root.type as ProcessType];

    if (!provenanceBuilder) {
      throw new Error(`Unsupported process type [${root.type}].`);
    }

    return provenanceBuilder(root);
  }
}
