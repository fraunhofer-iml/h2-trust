/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType } from '@h2-trust/domain';

export function buildProvenance(root: ProcessStepEntity, predecessorsOfRoot: ProcessStepEntity[]): ProvenanceEntity {
  if (!root || !root.type) {
    throw new Error('Invalid process step.');
  }

  switch (root.type) {
    case ProcessType.WATER_CONSUMPTION:
    case ProcessType.POWER_PRODUCTION:
      return new ProvenanceEntity(root, []);

    case ProcessType.HYDROGEN_PRODUCTION:
      return new ProvenanceEntity(root, buildProductionChains(predecessorsOfRoot));

    case ProcessType.HYDROGEN_BOTTLING:
    case ProcessType.HYDROGEN_TRANSPORTATION:
      return new ProvenanceEntity(
        root,
        buildProductionChains(predecessorsOfRoot),
        getHydrogenBottling(predecessorsOfRoot),
      );

    default:
      throw new Error(`Unsupported process type [${root.type}].`);
  }
}

function buildProductionChains(processSteps: ProcessStepEntity[]): ProductionChainEntity[] {
  const leafProductions: ProcessStepEntity[] = getLeafHydrogenProductions(processSteps);

  return leafProductions.map((leafProduction) => {
    const rootProduction: ProcessStepEntity = getRootProductionForLeaf(leafProduction, processSteps);
    const predecessors: ProcessStepEntity[] = resolvePredecessors(rootProduction, processSteps);
    const waterConsumption: ProcessStepEntity = predecessors.find((ps) => ps.batch.type === BatchType.WATER);
    const powerProduction: ProcessStepEntity = predecessors.find((ps) => ps.batch.type === BatchType.POWER);

    if (!waterConsumption) {
      throw new Error(`Missing water consumption predecessor for root production [${rootProduction.id}].`);
    }
    if (!powerProduction) {
      throw new Error(`Missing power production predecessor for root production [${rootProduction.id}].`);
    }

    return new ProductionChainEntity(
      leafProduction,
      rootProduction,
      powerProduction,
      waterConsumption,
      powerProduction.executedBy as PowerProductionUnitEntity,
      rootProduction.executedBy as HydrogenProductionUnitEntity,
    );
  });
}

function getLeafHydrogenProductions(processSteps: ProcessStepEntity[]): ProcessStepEntity[] {
  const bottling: ProcessStepEntity = getHydrogenBottling(processSteps);

  if (!bottling) {
    throw new Error('Missing bottling process step in production chain.');
  }

  const predecessorIds: string[] = bottling.batch.predecessors.map((pred) => pred.processStepId);
  return processSteps.filter((processStep) => predecessorIds.includes(processStep.id));
}

function getRootProductionForLeaf(
  leafHydrogenProduction: ProcessStepEntity,
  processSteps: ProcessStepEntity[],
): ProcessStepEntity {
  let currentBatch: BatchEntity = leafHydrogenProduction.batch;

  while (currentBatch.predecessors.length > 0) {
    const isRoot: boolean = currentBatch.predecessors.every(
      (pred) => pred.type === BatchType.POWER || pred.type === BatchType.WATER,
    );
    if (isRoot) {
      return findProcessStepById(currentBatch.processStepId, processSteps);
    }
    const nextProcessStepId: string = currentBatch.predecessors[0].processStepId;
    const nextProcessStep: ProcessStepEntity = findProcessStepById(nextProcessStepId, processSteps);
    if (!nextProcessStep) {
      throw new Error(`Process step [${nextProcessStepId}] not found while traversing production chain.`);
    }

    currentBatch = nextProcessStep.batch;
  }
  return undefined;
}

function getHydrogenBottling(processSteps: ProcessStepEntity[]): ProcessStepEntity | undefined {
  return processSteps.find((ps) => ps.type === ProcessType.HYDROGEN_BOTTLING);
}

function findProcessStepById(id: string, processSteps: ProcessStepEntity[]): ProcessStepEntity | undefined {
  return processSteps.find((ps) => ps.id === id);
}

function resolvePredecessors(processStep: ProcessStepEntity, processSteps: ProcessStepEntity[]): ProcessStepEntity[] {
  return processStep.batch.predecessors.map((pred) => {
    const resolved = findProcessStepById(pred.processStepId, processSteps);
    if (!resolved) {
      throw new Error(`Predecessor process step [${pred.processStepId}] not found.`);
    }
    return resolved;
  });
}
