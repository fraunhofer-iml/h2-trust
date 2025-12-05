/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, HydrogenProductionUnitEntity, PowerProductionUnitEntity, ProcessStepEntity, UnitMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProvenanceGraph } from '../../provenance/provenance-graph';
import { MatchedProductionPair } from './matched-production-pair';

@Injectable()
export class RedCompliancePairingService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy) {}

  // Overloaded API for backward-compatibility
  async buildMatchedPairs(graph: ProvenanceGraph): Promise<MatchedProductionPair[]>;
  async buildMatchedPairs(
    powerProductions: ProcessStepEntity[],
    hydrogenProductions: ProcessStepEntity[],
    _processStepId: string,
  ): Promise<MatchedProductionPair[]>;

  async buildMatchedPairs(
    arg1: ProvenanceGraph | ProcessStepEntity[],
    arg2?: ProcessStepEntity[],
    _processStepId?: string,
  ): Promise<MatchedProductionPair[]> {
    let graph: ProvenanceGraph;
    let explicitHydrogenSourceIds: string[] | undefined;
    if (Array.isArray(arg1)) {
      const powerProductions = arg1 as ProcessStepEntity[];
      const hydrogenProductions = arg2 ?? [];
      // Build a temporary graph from given steps
      const allSteps = [...new Map([...powerProductions, ...hydrogenProductions].map((p) => [p.id, p])).values()];
      graph = ProvenanceGraph.fromProcessSteps(allSteps);
      // Use explicit hydrogen sources when provided (robust even if type is missing)
      explicitHydrogenSourceIds = hydrogenProductions.filter(Boolean).map((h) => h.id!);
    } else {
      graph = arg1 as ProvenanceGraph;
    }

    const pairs: MatchedProductionPair[] = explicitHydrogenSourceIds?.length
      ? this.buildMatchedPairsFromExplicitHydrogenSources(graph, explicitHydrogenSourceIds)
      : this.buildMatchedPairsViaGraphTraversal(graph);

    if (!pairs?.length) {
      return [];
      // TODO throw exception when matching is solved in long chains
      // const message = `No matching power↔hydrogen production pairs found for processStepId [${processStepId}]`;
      // throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return await this.enrichPairsWithUnits(pairs);
  }
  private buildMatchedPairsViaGraphTraversal(graph: ProvenanceGraph): MatchedProductionPair[] {
    // Use generic graph matcher: all hydrogen sources -> nearest upstream power production
    const pairs = graph.matchPairs({
      sourceType: ProcessType.HYDROGEN_PRODUCTION as unknown as string,
      targetType: ProcessType.POWER_PRODUCTION as unknown as string,
      direction: 'UP',
      uniqueOn: 'source',
      sort: (a, b) => a.src.id.localeCompare(b.src.id) || a.tgt.id.localeCompare(b.tgt.id),
    });

    return pairs.map(({ src, tgt }) => ({
      power: { processStep: tgt.processStep },
      hydrogen: { processStep: src.processStep },
    }));
  }

  private buildMatchedPairsFromExplicitHydrogenSources(
    graph: ProvenanceGraph,
    hydrogenSourceIds: string[],
  ): MatchedProductionPair[] {
    const sources = hydrogenSourceIds
      .map((id) => graph.getNodeByProcessStepId(id))
      .filter((n): n is NonNullable<typeof n> => !!n);

    const pairs = graph.matchPairs({
      sources,
      targetType: ProcessType.POWER_PRODUCTION as unknown as string,
      direction: 'UP',
      uniqueOn: 'source',
      sort: (a, b) => a.src.id.localeCompare(b.src.id) || a.tgt.id.localeCompare(b.tgt.id),
    });

    return pairs.map(({ src, tgt }) => ({
      power: { processStep: tgt.processStep },
      hydrogen: { processStep: src.processStep },
    }));
  }

  private async enrichPairsWithUnits(pairs: MatchedProductionPair[]): Promise<MatchedProductionPair[]> {
    const { uniquePowerUnitIds, uniqueHydrogenUnitIds } = this.collectUniqueUnitIdsFromPairs(pairs);
    const { powerUnitById, hydrogenUnitById } = await this.fetchProductionUnits(
      uniquePowerUnitIds,
      uniqueHydrogenUnitIds,
    );

    return pairs.map((pair) => ({
      power: {
        processStep: pair.power.processStep,
        unit: powerUnitById.get(pair.power.processStep.executedBy.id),
      },
      hydrogen: {
        processStep: pair.hydrogen.processStep,
        unit: hydrogenUnitById.get(pair.hydrogen.processStep.executedBy.id),
      },
    }));
  }

  private collectUniqueUnitIdsFromPairs(pairs: MatchedProductionPair[]): {
    uniquePowerUnitIds: string[];
    uniqueHydrogenUnitIds: string[];
  } {
    const uniquePowerUnitIds = Array.from(new Set(pairs.map((pair) => pair.power.processStep.executedBy.id)));
    const uniqueHydrogenUnitIds = Array.from(new Set(pairs.map((pair) => pair.hydrogen.processStep.executedBy.id)));
    return { uniquePowerUnitIds, uniqueHydrogenUnitIds };
  }

  private async fetchProductionUnits(
    powerUnitIds: string[],
    hydrogenUnitIds: string[],
  ): Promise<{
    powerUnitById: Map<string, PowerProductionUnitEntity>;
    hydrogenUnitById: Map<string, HydrogenProductionUnitEntity>;
  }> {
    const [powerProductionUnitEntities, hydrogenProductionUnitEntities] = await Promise.all([
      firstValueFrom(
        this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, { ids: powerUnitIds }),
      ),
      firstValueFrom(
        this.generalSvc.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS, { ids: hydrogenUnitIds }),
      ),
    ]);

    const powerUnitById = new Map<string, PowerProductionUnitEntity>();
    for (const unit of powerProductionUnitEntities) powerUnitById.set(unit.id, unit);
    const hydrogenUnitById = new Map<string, HydrogenProductionUnitEntity>();
    for (const unit of hydrogenProductionUnitEntities) hydrogenUnitById.set(unit.id, unit);

    return { powerUnitById, hydrogenUnitById };
  }
}
