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
import { InternalException } from '@h2-trust/exceptions';
import { assertDefined } from '@h2-trust/utils';

export function buildProvenance(root: ProcessStepEntity, predecessorsOfRoot: ProcessStepEntity[]): ProvenanceEntity {
  if (!root || !root.type) {
    throw new InternalException('Invalid process step.');
  }

  switch (root.type) {
    case ProcessType.WATER_CONSUMPTION:
    case ProcessType.POWER_PRODUCTION:
      return new ProvenanceEntity(root, []);

    case ProcessType.HYDROGEN_PRODUCTION:
      return new ProvenanceEntity(root, buildProductionChains(predecessorsOfRoot));

    case ProcessType.HYDROGEN_BOTTLING:
    case ProcessType.HYDROGEN_TRANSPORTATION: {
      const hydrogenBottling: ProcessStepEntity = getHydrogenBottling(predecessorsOfRoot);
      if (!hydrogenBottling) {
        throw new InternalException(`Missing hydrogen bottling for root production [${root.id}].`);
      }
      return new ProvenanceEntity(
        root,
        buildProductionChains(predecessorsOfRoot),
        getHydrogenBottling(predecessorsOfRoot),
      );
    }
    default:
      throw new InternalException(`Unsupported process type [${root.type}].`);
  }
}

function buildProductionChains(processSteps: ProcessStepEntity[]): ProductionChainEntity[] {
  const bottling: ProcessStepEntity = getHydrogenBottling(processSteps);

  const leafProductions: ProcessStepEntity[] = bottling
    ? getLeafHydrogenProductions(bottling, processSteps)
    : getHydrogenProductions(processSteps);

  return leafProductions.map((leafProduction) => {
    const rootProduction: ProcessStepEntity = getRootProductionForLeaf(leafProduction, processSteps);
    const predecessors: ProcessStepEntity[] = resolvePredecessors(rootProduction, processSteps);
    const waterConsumption: ProcessStepEntity = predecessors.find((ps) => ps.batch.type === BatchType.WATER);
    const powerProduction: ProcessStepEntity = predecessors.find((ps) => ps.batch.type === BatchType.POWER);

    if (!waterConsumption) {
      throw new InternalException(`Missing water consumption predecessor for root production [${rootProduction.id}].`);
    }
    if (!powerProduction) {
      throw new InternalException(`Missing power production predecessor for root production [${rootProduction.id}].`);
    }

    assertDefined(powerProduction.executedBy, 'powerProduction.executedBy');
    assertDefined(rootProduction.executedBy, 'rootProduction.executedBy');
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

function getLeafHydrogenProductions(
  bottling: ProcessStepEntity,
  processSteps: ProcessStepEntity[],
): ProcessStepEntity[] {
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
    //Since this is not a root production, the predecessor list must never be empty here.
    //At the same time, the rule that a hydrogen production can have at most one hydrogen
    //production as a predecessor ensures that there are never more than one predecessor.
    const nextProcessStepId: string = currentBatch.predecessors[0].processStepId;
    const nextProcessStep: ProcessStepEntity = findProcessStepById(nextProcessStepId, processSteps);
    if (!nextProcessStep) {
      throw new InternalException(`Process step [${nextProcessStepId}] not found while traversing production chain.`);
    }

    currentBatch = nextProcessStep.batch;
  }
  throw new InternalException(`Missing root for leaf production.`);
}

function getHydrogenProductions(processSteps: ProcessStepEntity[]): ProcessStepEntity[] {
  const hydrogenProduction: ProcessStepEntity[] = processSteps.filter(
    (ps) => ps.type === ProcessType.HYDROGEN_PRODUCTION,
  );
  if (hydrogenProduction.length == 0) {
    throw new InternalException(`Missing [${ProcessType.HYDROGEN_PRODUCTION}] process step.`);
  }
  return hydrogenProduction;
}

function getHydrogenBottling(processSteps: ProcessStepEntity[]): ProcessStepEntity | undefined {
  return processSteps.find((ps) => ps.type === ProcessType.HYDROGEN_BOTTLING);
}

function findProcessStepById(id: string, processSteps: ProcessStepEntity[]): ProcessStepEntity {
  const foundProcessStep: ProcessStepEntity = processSteps.find((ps) => ps.id === id);
  if (!foundProcessStep) {
    throw new InternalException(`Missing process step for given id.`);
  }
  return foundProcessStep;
}

function resolvePredecessors(processStep: ProcessStepEntity, processSteps: ProcessStepEntity[]): ProcessStepEntity[] {
  return processStep.batch.predecessors.map((pred) => {
    const resolved = findProcessStepById(pred.processStepId, processSteps);
    if (!resolved) {
      throw new InternalException(`Predecessor process step [${pred.processStepId}] not found.`);
    }
    return resolved;
  });
}
