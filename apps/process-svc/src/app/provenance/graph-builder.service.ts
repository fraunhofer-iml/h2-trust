/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BatchEntity,
  BrokerQueues,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  BuildGraphParamsDto,
  GraphDirection,
  GraphEdgeDto,
  GraphMetaDto,
  GraphNodeDto,
  ProvenanceGraphDto,
} from '@h2-trust/amqp';

@Injectable()
export class GraphBuilderService {
  private static readonly DEFAULT_MAX_DEPTH = 50;
  private static readonly DEFAULT_MAX_NODES = 5000;

  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy) {}

  async buildGraph(params: BuildGraphParamsDto): Promise<ProvenanceGraphDto> {
    const direction: GraphDirection = params.direction ?? 'BOTH';
    const maxDepth = params.maxDepth ?? GraphBuilderService.DEFAULT_MAX_DEPTH;
    const maxNodes = params.maxNodes ?? GraphBuilderService.DEFAULT_MAX_NODES;

    const nodesById = new Map<string, GraphNodeDto>();
    const edges: GraphEdgeDto[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: params.rootId, depth: 0 }];

    let seen = 0;
    while (queue.length) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      seen++;
      if (seen > maxNodes || depth > maxDepth) break;

      const ps: ProcessStepEntity = await this.readProcessStep(id);
      if (!ps) continue;

      // add node (subset only)
      if (!nodesById.has(ps.id)) {
        nodesById.set(ps.id, {
          id: ps.id!,
          type: ps.type!,
          executedById: ps.executedBy?.id,
          batchAmount: ps.batch?.amount,
          startedAt: ps.startedAt?.toISOString?.() ?? (ps.startedAt as any),
          endedAt: ps.endedAt?.toISOString?.() ?? (ps.endedAt as any),
        });
      }

      // predecessors
      if (direction !== 'DOWN') {
        const predecessors: BatchEntity[] = ps.batch?.predecessors ?? [];
        for (const b of predecessors) {
          const fromId = b.processStepId;
          if (fromId) {
            // allocationRatio: share of predecessor's amount flowing to this successor (current ps)
            // Heuristic if explicit per-edge allocation is not available: proportional to successors' amounts
            const succs = Array.isArray(b.successors) ? b.successors : [];
            const totalSuccAmount = succs.reduce((sum, s) => sum + (Number(s.amount ?? 0)), 0);
            const currentAmount = Number(ps.batch?.amount ?? 0);
            const ratio = totalSuccAmount > 0 ? Math.min(Math.max(currentAmount / totalSuccAmount, 0), 1) : undefined;
            edges.push({ fromId, toId: ps.id!, allocationRatio: ratio });
            if (depth + 1 <= maxDepth) queue.push({ id: fromId, depth: depth + 1 });
          }
        }
      }

      // successors
      if (direction !== 'UP') {
        const successors: BatchEntity[] = ps.batch?.successors ?? [];
        if (successors.length) {
          const totalSuccAmount = successors.reduce((sum, s) => sum + (Number(s.amount ?? 0)), 0);
          for (const b of successors) {
            const toId = b.processStepId;
            if (toId) {
              const ratio = totalSuccAmount > 0 ? Math.min(Math.max(Number(b.amount ?? 0) / totalSuccAmount, 0), 1) : undefined;
              edges.push({ fromId: ps.id!, toId, allocationRatio: ratio });
              if (depth + 1 <= maxDepth) queue.push({ id: toId, depth: depth + 1 });
            }
          }
        }
      }
    }

    const meta: GraphMetaDto = {
      direction,
      maxDepth,
      maxNodes,
      visited: seen,
      truncated: seen >= maxNodes,
    };

    return {
      nodes: Array.from(nodesById.values()),
      edges,
      meta,
    };
  }

  private async readProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    return await new Promise<ProcessStepEntity>((resolve) => {
      // Using firstValueFrom inline to avoid importing rxjs here; the amqp ClientProxy supports toPromise via firstValueFrom
      // but to keep consistency with rest of codebase, we rely on READ_UNIQUE message handler returning ProcessStepEntity
      this.batchSvc
        .send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId })
        .subscribe({ next: (ps) => resolve(ps), error: () => resolve(undefined) });
    });
  }
}
