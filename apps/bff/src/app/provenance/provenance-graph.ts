/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProvenanceEntity, ProvenanceGraphDto } from '@h2-trust/amqp';

export interface GraphBatchNode {
  id: string; // processStepId
  processStep: ProcessStepEntity;
  predecessors: GraphBatchEdge[];
  successors: GraphBatchEdge[];
}

export interface GraphBatchEdge {
  from: GraphBatchNode;
  to: GraphBatchNode;
  allocationRatio?: number; // optional 0..1
}

export class ProvenanceGraph {
  private readonly nodesById = new Map<string, GraphBatchNode>();

  constructor(nodes: GraphBatchNode[]) {
    for (const n of nodes) this.nodesById.set(n.id, n);
  }

  static fromProcessSteps(processSteps: ProcessStepEntity[]): ProvenanceGraph {
    // Build nodes for the given set of process steps
    const byId = new Map<string, GraphBatchNode>();
    for (const ps of processSteps) {
      if (!ps || !ps.id) continue;
      byId.set(ps.id, { id: ps.id, processStep: ps, predecessors: [], successors: [] });
    }

    // Wire edges only between nodes that exist in the set
    for (const node of byId.values()) {
      const preds = node.processStep.batch?.predecessors ?? [];
      for (const b of preds) {
        const predNode = byId.get(b.processStepId);
        if (predNode) {
          const edge: GraphBatchEdge = { from: predNode, to: node };
          predNode.successors.push(edge);
          node.predecessors.push(edge);
        }
      }
      const succs = node.processStep.batch?.successors ?? [];
      for (const b of succs) {
        const succNode = byId.get(b.processStepId);
        if (succNode) {
          const edge: GraphBatchEdge = { from: node, to: succNode };
          node.successors.push(edge);
          succNode.predecessors.push(edge);
        }
      }
    }

    return new ProvenanceGraph(Array.from(byId.values()));
  }

  // Build a graph from a ProvenanceGraphDto only; hydrate lightweight ProcessStepEntity-like objects
  static fromDto(dto: ProvenanceGraphDto): ProvenanceGraph {
    const nodeById = new Map<string, GraphBatchNode>();

    for (const n of dto.nodes ?? []) {
      const psLite: ProcessStepEntity = {
        id: n.id,
        type: n.type,
        executedBy: n.executedById ? ({ id: n.executedById } as any) : undefined,
        batch: n.batchAmount !== undefined ? ({ amount: n.batchAmount } as any) : ({} as any),
        startedAt: n.startedAt ? new Date(n.startedAt) : (undefined as any),
        endedAt: n.endedAt ? new Date(n.endedAt) : (undefined as any),
      } as any;

      nodeById.set(n.id, {
        id: n.id,
        processStep: psLite,
        predecessors: [],
        successors: [],
      });
    }

    for (const e of dto.edges ?? []) {
      const from = nodeById.get(e.fromId);
      const to = nodeById.get(e.toId);
      if (!from || !to) continue;
      const edge: GraphBatchEdge = { from, to, allocationRatio: e.allocationRatio };
      from.successors.push(edge);
      to.predecessors.push(edge);
    }

    return new ProvenanceGraph(Array.from(nodeById.values()));
  }

  // Convenience: build graph from a ProvenanceEntity slice
  static fromProvenance(provenance: ProvenanceEntity): ProvenanceGraph {
    const steps: ProcessStepEntity[] = [];
    if (provenance?.root) steps.push(provenance.root);
    if (provenance?.hydrogenBottling) steps.push(provenance.hydrogenBottling);
    if (provenance?.hydrogenProductions?.length)
      steps.push(...provenance.hydrogenProductions.filter(Boolean));
    if (provenance?.powerProductions?.length) steps.push(...provenance.powerProductions.filter(Boolean));
    if (provenance?.waterConsumptions?.length) steps.push(...provenance.waterConsumptions.filter(Boolean));

    // Deduplicate and delegate
    const unique = [...new Map(steps.filter(Boolean).map((p) => [p.id, p])).values()];
    return ProvenanceGraph.fromProcessSteps(unique);
  }

  getNodeByProcessStepId(id: string): GraphBatchNode | undefined {
    return this.nodesById.get(id);
  }

  nodesOfType(type: string): GraphBatchNode[] {
    const result: GraphBatchNode[] = [];
    for (const n of this.nodesById.values()) {
      if (n.processStep?.type === type) result.push(n);
    }
    return result;
  }

  findFirstUpstream(
    start: GraphBatchNode,
    pred: (n: GraphBatchNode) => boolean,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode | undefined {
    const maxDepth = opts?.maxDepth ?? 50;
    const maxNodes = opts?.maxNodes ?? 2000;
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [];

    for (const e of start.predecessors) queue.push({ id: e.from.id, depth: 1 });

    let seen = 0;
    while (queue.length) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      seen++;
      if (seen > maxNodes) break;
      if (depth > maxDepth) continue;
      const node = this.nodesById.get(id);
      if (!node) continue;
      if (pred(node)) return node;
      for (const e of node.predecessors) queue.push({ id: e.from.id, depth: depth + 1 });
    }
    return undefined;
  }

  findAllUpstream(
    start: GraphBatchNode,
    pred?: (n: GraphBatchNode) => boolean,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode[] {
    const maxDepth = opts?.maxDepth ?? 100;
    const maxNodes = opts?.maxNodes ?? 5000;
    const visited = new Set<string>();
    const results: GraphBatchNode[] = [];
    const stack: Array<{ id: string; depth: number }> = [];
    for (const e of start.predecessors) stack.push({ id: e.from.id, depth: 1 });

    let seen = 0;
    while (stack.length) {
      const { id, depth } = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      seen++;
      if (seen > maxNodes) break;
      if (depth > maxDepth) continue;
      const node = this.nodesById.get(id);
      if (!node) continue;
      if (!pred || pred(node)) results.push(node);
      for (const e of node.predecessors) stack.push({ id: e.from.id, depth: depth + 1 });
    }
    return results;
  }

  findFirstDownstream(
    start: GraphBatchNode,
    pred: (n: GraphBatchNode) => boolean,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode | undefined {
    const maxDepth = opts?.maxDepth ?? 50;
    const maxNodes = opts?.maxNodes ?? 2000;
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [];
    for (const e of start.successors) queue.push({ id: e.to.id, depth: 1 });

    let seen = 0;
    while (queue.length) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      seen++;
      if (seen > maxNodes) break;
      if (depth > maxDepth) continue;
      const node = this.nodesById.get(id);
      if (!node) continue;
      if (pred(node)) return node;
      for (const e of node.successors) queue.push({ id: e.to.id, depth: depth + 1 });
    }
    return undefined;
  }

  findAllDownstream(
    start: GraphBatchNode,
    pred?: (n: GraphBatchNode) => boolean,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode[] {
    const maxDepth = opts?.maxDepth ?? 100;
    const maxNodes = opts?.maxNodes ?? 5000;
    const visited = new Set<string>();
    const results: GraphBatchNode[] = [];
    const stack: Array<{ id: string; depth: number }> = [];
    for (const e of start.successors) stack.push({ id: e.to.id, depth: 1 });

    let seen = 0;
    while (stack.length) {
      const { id, depth } = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      seen++;
      if (seen > maxNodes) break;
      if (depth > maxDepth) continue;
      const node = this.nodesById.get(id);
      if (!node) continue;
      if (!pred || pred(node)) results.push(node);
      for (const e of node.successors) stack.push({ id: e.to.id, depth: depth + 1 });
    }
    return results;
  }

  aggregateDownstream<T>(
    start: GraphBatchNode,
    agg: (n: GraphBatchNode) => T,
    combine: (a: T, b: T) => T,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): T | undefined {
    const maxDepth = opts?.maxDepth ?? 100;
    const maxNodes = opts?.maxNodes ?? 10000;
    const memo = new Map<string, T>();
    const visited = new Set<string>();
    let seen = 0;

    const dfs = (node: GraphBatchNode, depth: number): T => {
      if (memo.has(node.id)) return memo.get(node.id)!;
      if (visited.has(node.id)) return agg(node); // cycle guard fallback
      visited.add(node.id);
      seen++;
      if (seen > maxNodes || depth > maxDepth) {
        const val = agg(node);
        memo.set(node.id, val);
        return val;
      }
      let acc = agg(node);
      for (const e of node.successors) {
        const v = dfs(e.to, depth + 1);
        acc = combine(acc, v);
      }
      memo.set(node.id, acc);
      return acc;
    };

    return dfs(start, 0);
  }

  // === Generic matching & traversal helpers ===

  nearestUpstreamOfType(
    start: GraphBatchNode,
    type: string,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode | undefined {
    return this.findFirstUpstream(start, (n) => n.processStep?.type === type, opts);
  }

  nearestDownstreamOfType(
    start: GraphBatchNode,
    type: string,
    opts?: { maxDepth?: number; maxNodes?: number },
  ): GraphBatchNode | undefined {
    return this.findFirstDownstream(start, (n) => n.processStep?.type === type, opts);
  }

  matchPairs(params: {
    sourceType?: string;
    targetType: string;
    direction: 'UP' | 'DOWN';
    uniqueOn?: 'source' | 'target' | 'none';
    filter?: (src: GraphBatchNode, tgt: GraphBatchNode) => boolean;
    sort?: (a: { src: GraphBatchNode; tgt: GraphBatchNode }, b: { src: GraphBatchNode; tgt: GraphBatchNode }) => number;
    opts?: { maxDepth?: number; maxNodes?: number };
    sources?: GraphBatchNode[]; // optional explicit sources
  }): Array<{ src: GraphBatchNode; tgt: GraphBatchNode }> {
    const sources: GraphBatchNode[] = params.sources
      ? params.sources.filter(Boolean)
      : params.sourceType
      ? this.nodesOfType(params.sourceType)
      : [];

    const used = new Set<string>();
    const out: Array<{ src: GraphBatchNode; tgt: GraphBatchNode }> = [];

    for (const s of sources) {
      const t = params.direction === 'UP'
        ? this.nearestUpstreamOfType(s, params.targetType, params.opts)
        : this.nearestDownstreamOfType(s, params.targetType, params.opts);
      if (!t) continue;
      if (params.uniqueOn === 'source' && used.has(s.id)) continue;
      if (params.uniqueOn === 'target' && used.has(t.id)) continue;
      if (params.filter && !params.filter(s, t)) continue;
      out.push({ src: s, tgt: t });
      if (params.uniqueOn === 'source') used.add(s.id);
      if (params.uniqueOn === 'target') used.add(t.id);
    }

    if (params.sort) out.sort(params.sort);
    return out;
  }
}
