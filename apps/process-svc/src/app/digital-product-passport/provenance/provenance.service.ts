/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity, ProductionChainEntity, ProvenanceEntity } from '@h2-trust/contracts/entities';
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
      return new ProvenanceEntity(root, predecessorsOfRoot, []);

    case ProcessType.HYDROGEN_PRODUCTION:
      return new ProvenanceEntity(root, predecessorsOfRoot, buildProductionChains(root, predecessorsOfRoot));

    default:
      return new ProvenanceEntity(
        root,
        handleSplitProcessSteps(predecessorsOfRoot),
        buildProductionChains(root, predecessorsOfRoot),
      );
  }
}

function handleSplitProcessSteps(predecessorsOfRoot: ProcessStepEntity[]) {
  const predecessorsWithoutSplittingSteps = predecessorsOfRoot.map((pred) =>
    getFirstProcessStepOfSplittingChain(pred, predecessorsOfRoot),
  );
  return Array.from(new Map(predecessorsWithoutSplittingSteps.map((obj) => [obj.id, obj])).values());
}

function getFirstProcessStepOfSplittingChain(
  lastProcessStep: ProcessStepEntity,
  predecessorsOfRoot: ProcessStepEntity[],
) {
  const predecessorIds: string[] = lastProcessStep.batch.predecessors.map((pred) => pred.id);
  const predecessors: ProcessStepEntity[] = predecessorsOfRoot.filter((pred) => predecessorIds.includes(pred.batch.id));

  const predecessorTypes: ProcessType[] = predecessors.map((predecessor) => predecessor.type);
  if (predecessorTypes.includes(lastProcessStep.type)) {
    return getFirstProcessStepOfSplittingChain(predecessors[0], predecessorsOfRoot);
  }
  return lastProcessStep;
}

function buildProductionChains(root: ProcessStepEntity, processSteps: ProcessStepEntity[]): ProductionChainEntity[] {
  const leafProductions: ProcessStepEntity[] = getLeafHydrogenProductions(root, processSteps);

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
      powerProduction.executedBy,
      rootProduction.executedBy,
    );
  });
}

/**
 * Accepts the list of all nodes in the process chain. The entire process chain is examined for elements
 * that are HYDROGEN_PRODUCTION but do not have HYDROGEN_PRODUCTION as a successor. These elements are referred to as leaf hydrogen production.
 * @param processSteps The list of all process steps in the process chain.
 * @returns The last HYDROGEN_PRODUCTION process steps in the process chain (leaf hydrogen production).
 */
function getLeafHydrogenProductions(root: ProcessStepEntity, processSteps: ProcessStepEntity[]): ProcessStepEntity[] {
  //If the leaf productions are to be retrieved for a root element that is itself of type HYDROGEN_PRODUCTION, then this root element is also the leaf productions element.
  if (root.type === ProcessType.HYDROGEN_PRODUCTION) {
    return [root];
  }
  //Since hydrogen production is at the beginning of every process chain, all process steps that do not have one of the production types (HYDROGEN_PRODUCTION,
  //POWER_PRODUCTION, and WATER_CONSUMPTION) necessarily have a HYDROGEN_PRODUCTION element as a (distant) predecessor.
  const nonProductionProcessSteps: ProcessStepEntity[] = processSteps.filter(
    (processStep) =>
      processStep.type !== ProcessType.HYDROGEN_PRODUCTION &&
      processStep.type !== ProcessType.WATER_CONSUMPTION &&
      processStep.type !== ProcessType.POWER_PRODUCTION,
  );
  //All predecessors of non-production process steps of type HYDROGEN_PRODUCTION are returned. By definition, these are the leaf production elements.
  return nonProductionProcessSteps.flatMap((processStep) => {
    const predecessorIds: string[] = processStep.batch.predecessors.map((pred) => pred.processStepId);
    return processSteps.filter(
      (processStep) => predecessorIds.includes(processStep.id) && processStep.type === ProcessType.HYDROGEN_PRODUCTION,
    );
  });
}

/**
 * Accepts a hydrogen leaf element in the process chain. Traverse the list of predecessors until a HYDROGEN_PRODUCTION element is reached that has no further
 * HYDROGEN_PRODUCTION elements as predecessors (root hydrogen production).
 * @param leafHydrogenProduction The leaf hydrogen production element, which may have other hydrogen production elements as its predecessors.
 * @param processSteps The list of all process steps in the process chain.
 * @returns
 */
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

function findProcessStepById(id: string, processSteps: ProcessStepEntity[]): ProcessStepEntity {
  const foundProcessStep: ProcessStepEntity = processSteps.find((ps) => ps.id === id);
  if (!foundProcessStep) {
    throw new InternalException(`Missing process step for given id ${id}.`);
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
