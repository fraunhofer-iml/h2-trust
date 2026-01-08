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
  BrokerQueues,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProvenanceEntity,
  ReadByIdPayload,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';

type ProvenanceBuilderFn = (root: ProcessStepEntity) => Promise<ProvenanceEntity>;

@Injectable()
export class ProvenanceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    private readonly traversalService: TraversalService,
  ) {}

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
      const waterConsumptions =
        await this.traversalService.fetchWaterConsumptionsFromHydrogenProductions(hydrogenProductions);
      const powerProductions =
        await this.traversalService.fetchPowerProductionsFromHydrogenProductions(hydrogenProductions);
      return new ProvenanceEntity(root, undefined, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_BOTTLING]: async (root) => {
      const hydrogenProductions = await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(root);
      const waterConsumptions =
        await this.traversalService.fetchWaterConsumptionsFromHydrogenProductions(hydrogenProductions);
      const powerProductions =
        await this.traversalService.fetchPowerProductionsFromHydrogenProductions(hydrogenProductions);
      return new ProvenanceEntity(root, root, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: async (root) => {
      const hydrogenBottling = await this.traversalService.fetchHydrogenBottlingFromHydrogenTransportation(root);
      const hydrogenProductions =
        await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(hydrogenBottling);
      const waterConsumptions =
        await this.traversalService.fetchWaterConsumptionsFromHydrogenProductions(hydrogenProductions);
      const powerProductions =
        await this.traversalService.fetchPowerProductionsFromHydrogenProductions(hydrogenProductions);
      return new ProvenanceEntity(root, hydrogenBottling, hydrogenProductions, waterConsumptions, powerProductions);
    },
  };

  async buildProvenance(payload: ReadByIdPayload): Promise<ProvenanceEntity> {
    if (!payload.id) {
      throw new Error('processStepId must be provided.');
    }

    const root: ProcessStepEntity = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, new ReadByIdPayload(payload.id)),
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
