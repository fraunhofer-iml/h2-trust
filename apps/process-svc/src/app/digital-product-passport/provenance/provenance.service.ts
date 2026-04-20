/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';

type ProvenanceBuilderFn = (root: ProcessStepEntity) => Promise<ProvenanceEntity>;

@Injectable()
export class ProvenanceService {
  constructor(private readonly traversalService: TraversalService) {}

  public async buildProvenance(root: ProcessStepEntity): Promise<ProvenanceEntity> {
    if (!root || !root.type) {
      throw new Error('Invalid process step.');
    }
    const provenanceBuilder: ProvenanceBuilderFn = this.provenanceBuilders[root.type];

    if (!provenanceBuilder) {
      throw new Error(`Unsupported process type [${root.type}].`);
    }

    return provenanceBuilder(root);
  }

  private async getProductionChain(hydrogenLeafProduction: ProcessStepEntity): Promise<ProductionChainEntity> {
    const hydrogenRootProductions = await this.getRootHydrogenProductionsForHydrogenProductions([
      hydrogenLeafProduction,
    ]);
    const rootHydrogenProduction: ProcessStepEntity = hydrogenRootProductions.find(
      (ps) => ps.batch.type == BatchType.HYDROGEN,
    );
    const waterConsumption: ProcessStepEntity = hydrogenRootProductions.find((ps) => ps.batch.type == BatchType.WATER);
    const powerProduction: ProcessStepEntity = hydrogenRootProductions.find((ps) => ps.batch.type == BatchType.POWER);

    return new ProductionChainEntity(
      hydrogenLeafProduction,
      rootHydrogenProduction,
      powerProduction,
      waterConsumption,
      powerProduction.executedBy as PowerProductionUnitEntity,
      rootHydrogenProduction.executedBy as HydrogenProductionUnitEntity,
    );
  }

  private readonly provenanceBuilders: Record<ProcessType, ProvenanceBuilderFn> = {
    [ProcessType.WATER_CONSUMPTION]: async (root) => {
      return new ProvenanceEntity(root, []);
    },
    [ProcessType.POWER_PRODUCTION]: async (root) => {
      return new ProvenanceEntity(root, []);
    },
    [ProcessType.HYDROGEN_PRODUCTION]: async (root) => {
      const productionChain: ProductionChainEntity = await this.getProductionChain(root);
      return new ProvenanceEntity(root, [productionChain]);
    },

    [ProcessType.HYDROGEN_BOTTLING]: async (root) => {
      const leafProductionsOfBottling: ProcessStepEntity[] =
        await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(root);

      const productionChains = [];

      for (const hydrogenLeafProduction of leafProductionsOfBottling) {
        const productionChain: ProductionChainEntity = await this.getProductionChain(hydrogenLeafProduction);
        productionChains.push(productionChain);
      }

      return new ProvenanceEntity(root, productionChains, root);
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: async (root) => {
      //since we are assuming the TRANSPORT type here, we must first retrieve the BOTTLING element of the TRANSPORT and then proceed as if the root type were BOTTLING.
      const hydrogenBottling: ProcessStepEntity =
        await this.traversalService.fetchHydrogenBottlingFromHydrogenTransportation(root);
      const leafProductionsOfBottling: ProcessStepEntity[] =
        await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(hydrogenBottling);

      const productionChains = [];

      for (const hydrogenLeafProduction of leafProductionsOfBottling) {
        const productionChain: ProductionChainEntity = await this.getProductionChain(hydrogenLeafProduction);
        productionChains.push(productionChain);
      }
      return new ProvenanceEntity(root, productionChains, hydrogenBottling);
    },
  };

  //TODO-LG: Improve performance (DUHGW-391)
  private async getRootHydrogenProductionsForHydrogenProductions(
    hydrogenProductions: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    return (await Promise.all(hydrogenProductions.map((ps) => this.getRootHydrogenProductions(ps)))).flatMap((x) => x);
  }

  /**
   * Goes through all predecessors of the transferred process step step by step and returns all predecessors that are directly at the beginning of the chain, i.e. POWER, WATER and root HYDROGEN process steps.
   */
  private async getRootHydrogenProductions(processStep: ProcessStepEntity): Promise<ProcessStepEntity[]> {
    if (this.isProcessStepRootHydrogenProduction(processStep)) {
      const rootHydrogenProductionPredecessors = await this.traversalService.getPredecessorsForBatch(processStep.batch);
      return [processStep, ...rootHydrogenProductionPredecessors];
    }
    const predecessors: ProcessStepEntity[] = await this.traversalService.getPredecessorsForBatch(processStep.batch);
    return (await Promise.all(predecessors.map((pred) => this.getRootHydrogenProductions(pred)))).flatMap((x) => x);
  }

  /**
   * Checks whether the specified process step has only POWER and WATER batches as predecessors, which means that it is a root HydrogenProduction, i.e. a Hydrogen Production that was created directly.
   */
  private isProcessStepRootHydrogenProduction(processStep: ProcessStepEntity): boolean {
    return processStep.batch.predecessors.every((pred) => pred.type == BatchType.POWER || pred.type == BatchType.WATER);
  }
}
