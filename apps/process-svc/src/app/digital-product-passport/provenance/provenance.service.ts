/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  BatchEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType } from '@h2-trust/domain';

type ProvenanceBuilderFn = (root: ProcessStepEntity, predecessorsOfRoot: ProcessStepEntity[]) => ProvenanceEntity;

@Injectable()
export class ProvenanceService {
  buildProvenance(root: ProcessStepEntity, predecessorsOfRoot: ProcessStepEntity[]): ProvenanceEntity {
    if (!root || !root.type) {
      throw new Error('Invalid process step.');
    }
    const provenanceBuilder: ProvenanceBuilderFn = this.provenanceBuilders[root.type];

    if (!provenanceBuilder) {
      throw new Error(`Unsupported process type [${root.type}].`);
    }

    return provenanceBuilder(root, predecessorsOfRoot);
  }

  private getProductionChain(processSteps: ProcessStepEntity[]): ProductionChainEntity[] {
    const productionChains = [];
    const bottling = processSteps.find((ps) => ps.type == ProcessType.HYDROGEN_BOTTLING);

    if (!bottling) {
      throw new Error('Missing bottling process step.');
    }

    const hydrogenLeafProductions: ProcessStepEntity[] =
      this.getLeafHydrogenProductionsFromProductionChain(processSteps);

    for (const hydrogenLeafProduction of hydrogenLeafProductions) {
      const hydrogenRootProduction: ProcessStepEntity = this.getRootProductionForLeafProduction(
        hydrogenLeafProduction,
        processSteps,
      );
      const hydrogenRootProductionPredecessors: ProcessStepEntity[] = hydrogenRootProduction.batch.predecessors
        .map((pred) => pred.processStepId)
        .map((predPs) => processSteps.find((ps) => ps.id == predPs));
      const waterConsumption: ProcessStepEntity = hydrogenRootProductionPredecessors.find(
        (ps) => ps.batch.type == BatchType.WATER,
      );
      const powerProduction: ProcessStepEntity = hydrogenRootProductionPredecessors.find(
        (ps) => ps.batch.type == BatchType.POWER,
      );

      const newProdChain = new ProductionChainEntity(
        hydrogenLeafProduction,
        hydrogenRootProduction,
        powerProduction,
        waterConsumption,
        powerProduction.executedBy as PowerProductionUnitEntity,
        hydrogenRootProduction.executedBy as HydrogenProductionUnitEntity,
      );
      productionChains.push(newProdChain);
    }
    return productionChains;
  }

  private readonly provenanceBuilders: Record<ProcessType, ProvenanceBuilderFn> = {
    [ProcessType.WATER_CONSUMPTION]: (root) => {
      return new ProvenanceEntity(root, []);
    },
    [ProcessType.POWER_PRODUCTION]: (root) => {
      return new ProvenanceEntity(root, []);
    },
    [ProcessType.HYDROGEN_PRODUCTION]: (root, allRelevantProcessSteps) => {
      const productionChains = this.getProductionChain(allRelevantProcessSteps);
      return new ProvenanceEntity(root, productionChains);
    },

    [ProcessType.HYDROGEN_BOTTLING]: (root, allRelevantProcessSteps) => {
      const productionChains = this.getProductionChain(allRelevantProcessSteps);

      return new ProvenanceEntity(root, productionChains, root);
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: (root, allRelevantProcessSteps) => {
      //since we are assuming the TRANSPORT type here, we must first retrieve the BOTTLING element of the TRANSPORT and then proceed as if the root type were BOTTLING.
      //await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(root);

      const bottling: ProcessStepEntity = allRelevantProcessSteps.find(
        (ps) => ps.type == ProcessType.HYDROGEN_BOTTLING,
      );
      const productionChains = this.getProductionChain(allRelevantProcessSteps);

      return new ProvenanceEntity(root, productionChains, bottling);
    },
  };

  private getLeafHydrogenProductionsFromProductionChain(
    relevantProcessSteps: ProcessStepEntity[],
  ): ProcessStepEntity[] {
    const bottling: ProcessStepEntity = relevantProcessSteps.find(
      (processStep) => processStep.type == ProcessType.HYDROGEN_BOTTLING,
    );

    if (!bottling) {
      throw new Error('Bottling is not present.');
    }
    const predecessorIdsOfBottling: string[] = bottling.batch.predecessors.map((pred) => pred.processStepId);
    return relevantProcessSteps.filter((processStep) => predecessorIdsOfBottling.includes(processStep.id));
  }

  private getRootProductionForLeafProduction(
    leafHydrogenProduction: ProcessStepEntity,
    allRelevantProcessSteps: ProcessStepEntity[],
  ): ProcessStepEntity {
    let rootHydrogenProductionCandiate: BatchEntity = leafHydrogenProduction.batch;

    while (rootHydrogenProductionCandiate.predecessors.length > 0) {
      const isBatchRootHydrogenProduction: boolean = rootHydrogenProductionCandiate.predecessors.every(
        (pred) => pred.type == BatchType.POWER || pred.type == BatchType.WATER,
      );
      if (isBatchRootHydrogenProduction) {
        return allRelevantProcessSteps.find((ps) => ps.id == rootHydrogenProductionCandiate.processStepId);
      }
      const candidateId: string = rootHydrogenProductionCandiate.predecessors[0].processStepId;
      rootHydrogenProductionCandiate = allRelevantProcessSteps.find((ps) => ps.id == candidateId).batch;
    }
    return undefined;
  }
}
