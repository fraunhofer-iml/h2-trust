/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export type GraphDirection = 'UP' | 'DOWN' | 'BOTH';

export interface BuildGraphParamsDto {
  rootId: string;
  direction?: GraphDirection;
  maxDepth?: number;
  maxNodes?: number;
}

export interface GraphNodeDto {
  id: string; // processStepId
  type: string;
  executedById?: string;
  batchAmount?: number;
  startedAt?: string; // ISO
  endedAt?: string;   // ISO
}

export interface GraphEdgeDto {
  fromId: string;
  toId: string;
  allocationRatio?: number; // optional 0..1 if available
}

export interface GraphMetaDto {
  direction: GraphDirection;
  maxDepth: number;
  maxNodes: number;
  visited: number;
  truncated: boolean;
}

export interface ProvenanceGraphDto {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
  meta: GraphMetaDto;
}
