/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';

type ProvenanceBuilderFn = (root: ProcessStepEntity) => Promise<ProvenanceEntity>;

@Injectable()
export class ProvenanceService {
  constructor(private readonly traversalService: TraversalService) {}

  async buildProvenance(root: ProcessStepEntity): Promise<ProvenanceEntity> {
    if (!root || !root.type) {
      throw new Error('Invalid process step.');
    }

    const provenanceBuilder: ProvenanceBuilderFn = this.provenanceBuilders[root.type as ProcessType];

    if (!provenanceBuilder) {
      throw new Error(`Unsupported process type [${root.type}].`);
    }

    return provenanceBuilder(root);
  }

  private readonly provenanceBuilders: Record<ProcessType, ProvenanceBuilderFn> = {
    [ProcessType.POWER_PRODUCTION]: async (root) => {
      const powerProductions = [root];
      return new ProvenanceEntity(root, undefined, [], [], powerProductions);
    },

    [ProcessType.WATER_CONSUMPTION]: async (root) => {
      const waterConsumptions = [root];
      return new ProvenanceEntity(root, undefined, [], waterConsumptions, []);
    },

    [ProcessType.HYDROGEN_PRODUCTION]: async (root) => {
      const hydrogenProductions = [root];
      const waterConsumptions =
        await this.traversalService.fetchWaterConsumptionsFromHydrogenProductions(hydrogenProductions);
      const powerProductions =
        await this.traversalService.fetchPowerProductionsFromHydrogenProductions(hydrogenProductions);
      return new ProvenanceEntity(root, undefined, hydrogenProductions, waterConsumptions, powerProductions);
    },

    [ProcessType.HYDROGEN_BOTTLING]: async (root) => {
      const provenanceEntriesOfBottling = await this.getProvenanceEntriesOfBottling(root);
      return new ProvenanceEntity(
        root,
        root,
        provenanceEntriesOfBottling.rootHydrogenProductions,
        provenanceEntriesOfBottling.waterConsumptions,
        provenanceEntriesOfBottling.powerProductions,
      );
    },

    [ProcessType.HYDROGEN_TRANSPORTATION]: async (root) => {
      //since we are assuming the TRANSPORT type here, we must first retrieve the BOTTLING element of the TRANSPORT and then proceed as if the root type were BOTTLING.
      const hydrogenBottling: ProcessStepEntity =
        await this.traversalService.fetchHydrogenBottlingFromHydrogenTransportation(root);
      const provenanceEntriesOfBottling = await this.getProvenanceEntriesOfBottling(hydrogenBottling);
      return new ProvenanceEntity(
        root,
        hydrogenBottling,
        provenanceEntriesOfBottling.rootHydrogenProductions,
        provenanceEntriesOfBottling.waterConsumptions,
        provenanceEntriesOfBottling.powerProductions,
      );
    },
  };

  private async getProvenanceEntriesOfBottling(bottlingProcessStep: ProcessStepEntity): Promise<{
    rootHydrogenProductions: ProcessStepEntity[];
    waterConsumptions: ProcessStepEntity[];
    powerProductions: ProcessStepEntity[];
  }> {
    //storedHydrogen are the direct predecessors of the bottling (but not necessarily the root hydrogen production)
    const directPredecessorsOfBottling: ProcessStepEntity[] =
      await this.traversalService.fetchHydrogenProductionsFromHydrogenBottling(bottlingProcessStep);
    //the rootProcessSteps are the POWER and WATER ProcessSteps and the direct successor of these ProcessSteps (the root hydrogen productions)
    const rootProcessSteps = await this.getRootHydrogenProductionsForHydrogenProductions(directPredecessorsOfBottling);
    const rootHydrogenProductions = rootProcessSteps.filter((ps) => ps.batch.type == BatchType.HYDROGEN);
    const waterConsumptions = rootProcessSteps.filter((ps) => ps.batch.type == BatchType.WATER);
    const powerProductions = rootProcessSteps.filter((ps) => ps.batch.type == BatchType.POWER);
    return { rootHydrogenProductions, waterConsumptions, powerProductions };
  }

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
      const waterAndPowerPS = await this.traversalService.getPredecessorsForBatch(processStep.batch);
      return [processStep, ...waterAndPowerPS];
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
