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
  ProvenanceGraphDto,
} from '@h2-trust/amqp';
import { GraphBuilderService } from './graph-builder.service';
import { ProvenanceAssembler } from './provenance.assembler';

@Injectable()
export class ProvenanceService {

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    private readonly graphBuilder: GraphBuilderService,
    private readonly provenanceAssembler: ProvenanceAssembler,
  ) {}

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

    // Build graph directly from DB starting at the root, both directions, with defaults
    const graph: ProvenanceGraphDto = await this.graphBuilder.buildGraph({ rootId: processStepId, direction: 'BOTH' });
    // Derive the existing ProvenanceEntity view from the graph for backward compatibility
    return this.provenanceAssembler.fromGraph(graph, root.id);
  }
}
