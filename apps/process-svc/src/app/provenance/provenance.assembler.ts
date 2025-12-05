/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import {
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProvenanceEntity,
  ProvenanceGraphDto,
  BrokerQueues,
} from '@h2-trust/amqp';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProcessType } from '@h2-trust/domain';

@Injectable()
export class ProvenanceAssembler {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy) {}

  async fromGraph(graph: ProvenanceGraphDto, rootId: string): Promise<ProvenanceEntity> {
    const root = await this.fetchProcessStep(rootId);
    if (!root) throw new Error('Invalid process step.');

    // Build adjacency (upstream) map for convenience
    const upstream = new Map<string, string[]>();
    for (const e of graph.edges) {
      // edge fromId -> toId
      if (!upstream.has(e.toId)) upstream.set(e.toId, []);
      upstream.get(e.toId)!.push(e.fromId);
    }

    const nodesById = new Map(graph.nodes.map((n) => [n.id, n] as const));

    const findDirectPredecessorsOfType = (id: string, type: string): string[] => {
      const preds = upstream.get(id) ?? [];
      return preds.filter((pid) => nodesById.get(pid)?.type === type);
    };

    const collectAllUpstreamOfTypes = (startIds: string[], allowedTypes: string[]): string[] => {
      const visited = new Set<string>();
      const result = new Set<string>();
      const stack: string[] = [...startIds];
      while (stack.length) {
        const id = stack.pop()!;
        if (visited.has(id)) continue;
        visited.add(id);
        const preds = upstream.get(id) ?? [];
        for (const pid of preds) {
          const n = nodesById.get(pid);
          if (!n) continue;
          if (allowedTypes.includes(n.type)) result.add(n.id);
          stack.push(pid);
        }
      }
      return Array.from(result);
    };

    let hydrogenBottling: ProcessStepEntity | undefined;
    let hydrogenProductions: ProcessStepEntity[] | undefined;
    let waterConsumptions: ProcessStepEntity[] | undefined;
    let powerProductions: ProcessStepEntity[] | undefined;

    if (root.type === ProcessType.POWER_PRODUCTION) {
      powerProductions = [root];
    } else if (root.type === ProcessType.WATER_CONSUMPTION) {
      waterConsumptions = [root];
    } else if (root.type === ProcessType.HYDROGEN_PRODUCTION) {
      hydrogenProductions = [root];
      const allUpstream = collectAllUpstreamOfTypes([root.id!], [
        ProcessType.POWER_PRODUCTION as unknown as string,
        ProcessType.WATER_CONSUMPTION as unknown as string,
      ]);
      powerProductions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.POWER_PRODUCTION as unknown as string)));
      waterConsumptions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.WATER_CONSUMPTION as unknown as string)));
    } else if (root.type === ProcessType.HYDROGEN_BOTTLING) {
      // hydrogenProductions are upstream (possibly multi-layer)
      const upstreamHydrogen = collectAllUpstreamOfTypes([root.id!], [ProcessType.HYDROGEN_PRODUCTION as unknown as string]);
      hydrogenProductions = await this.fetchProcessSteps(upstreamHydrogen);
      const allUpstream = collectAllUpstreamOfTypes(upstreamHydrogen, [
        ProcessType.POWER_PRODUCTION as unknown as string,
        ProcessType.WATER_CONSUMPTION as unknown as string,
      ]);
      powerProductions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.POWER_PRODUCTION as unknown as string)));
      waterConsumptions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.WATER_CONSUMPTION as unknown as string)));
      hydrogenBottling = root;
    } else if (root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      // find direct predecessor of type HYDROGEN_BOTTLING; enforce exactly one
      const preds = findDirectPredecessorsOfType(root.id!, ProcessType.HYDROGEN_BOTTLING as unknown as string);
      if (preds.length !== 1) {
        throw new Error(
          `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [${preds.length}].`,
        );
      }
      hydrogenBottling = await this.fetchProcessStep(preds[0]);
      // hydrogenProductions are upstream of bottling
      const upstreamHydrogen = collectAllUpstreamOfTypes([hydrogenBottling.id!], [
        ProcessType.HYDROGEN_PRODUCTION as unknown as string,
      ]);
      hydrogenProductions = await this.fetchProcessSteps(upstreamHydrogen);
      const allUpstream = collectAllUpstreamOfTypes(upstreamHydrogen, [
        ProcessType.POWER_PRODUCTION as unknown as string,
        ProcessType.WATER_CONSUMPTION as unknown as string,
      ]);
      powerProductions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.POWER_PRODUCTION as unknown as string)));
      waterConsumptions = await this.fetchProcessSteps(allUpstream.filter((id) => nodesById.get(id)?.type === (ProcessType.WATER_CONSUMPTION as unknown as string)));
    }

    return new ProvenanceEntity(root, hydrogenBottling, hydrogenProductions, waterConsumptions, powerProductions);
  }

  private async fetchProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    return firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );
  }

  private async fetchProcessSteps(ids: string[]): Promise<ProcessStepEntity[]> {
    // If empty, short-circuit to avoid unnecessary calls
    if (!ids?.length) return [];
    // No bulk endpoint available yet – fetch sequentially
    const uniqueIds = Array.from(new Set(ids));
    return Promise.all(uniqueIds.map((id) => this.fetchProcessStep(id)));
  }
}
