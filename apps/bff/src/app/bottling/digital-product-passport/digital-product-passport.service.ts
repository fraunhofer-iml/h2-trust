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
import { BrokerQueues, ProvenanceMessagePatterns, ProvenanceGraphDto } from '@h2-trust/amqp';
import { EmissionComputationResultDto, ProofOfSustainabilityDto, SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionComputationService } from './emission-computation.service';
import { HydrogenBottlingSectionService } from './proof-of-origin/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './proof-of-origin/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './proof-of-origin/hydrogen-transportation-section.service';
import { ProvenanceGraph } from '../../provenance/provenance-graph';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionService: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
    private readonly emissionComputationService: EmissionComputationService,
  ) {}

  async buildProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    // Build provenance graph (graph-first)
    const graphDto: ProvenanceGraphDto = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_GRAPH, {
        rootId: processStepId,
        direction: 'BOTH',
        maxDepth: 50,
        maxNodes: 5000,
      }),
    );

    const graph = ProvenanceGraph.fromDto(graphDto);
    const root = graph.getNodeByProcessStepId(processStepId);

    // Collect process steps by type from the graph slice
    const powerProductions = graph
      .nodesOfType(ProcessType.POWER_PRODUCTION as unknown as string)
      .map((n) => n.processStep);
    const waterConsumptions = graph
      .nodesOfType(ProcessType.WATER_CONSUMPTION as unknown as string)
      .map((n) => n.processStep);
    const hydrogenProductions = graph
      .nodesOfType(ProcessType.HYDROGEN_PRODUCTION as unknown as string)
      .map((n) => n.processStep);
    const bottlingNodes = graph.nodesOfType(ProcessType.HYDROGEN_BOTTLING as unknown as string);
    const transportationNodes = graph.nodesOfType(ProcessType.HYDROGEN_TRANSPORTATION as unknown as string);

    // Determine entry context: prefer Transportation, else Bottling, else HydrogenProduction
    let entryTransportation = undefined as any;
    let entryBottling = undefined as any;

    if (root?.processStep?.type === (ProcessType.HYDROGEN_TRANSPORTATION as unknown as string)) {
      entryTransportation = root.processStep;
      // find direct predecessor bottling if available (or nearest upstream bottling)
      const nearestBottling = graph.nearestUpstreamOfType(root, ProcessType.HYDROGEN_BOTTLING as unknown as string);
      entryBottling = nearestBottling?.processStep;
    } else if (root?.processStep?.type === (ProcessType.HYDROGEN_BOTTLING as unknown as string)) {
      entryBottling = root.processStep;
      // optional: find a downstream transportation if any
      const nearestTransportation = graph.nearestDownstreamOfType(
        root,
        ProcessType.HYDROGEN_TRANSPORTATION as unknown as string,
      );
      entryTransportation = nearestTransportation?.processStep;
    } else if (root) {
      // starting at production or other type: try to find downstream bottling / transportation
      const nearestBottling = graph.nearestDownstreamOfType(root, ProcessType.HYDROGEN_BOTTLING as unknown as string);
      entryBottling = nearestBottling?.processStep;
      if (nearestBottling) {
        const nearestTransportation = graph.nearestDownstreamOfType(
          nearestBottling,
          ProcessType.HYDROGEN_TRANSPORTATION as unknown as string,
        );
        entryTransportation = nearestTransportation?.processStep;
      }
    }

    const sectionPromises: Array<Promise<SectionDto | undefined>> = [];

    // Hydrogen Production Section (power + water + hydrogen)
    sectionPromises.push(
      this.hydrogenProductionSectionService.buildSection(powerProductions, waterConsumptions, hydrogenProductions),
    );

    // Hydrogen Storage Section (based on hydrogen productions)
    sectionPromises.push(
      hydrogenProductions?.length ? this.hydrogenStorageSectionService.buildSection(hydrogenProductions) : undefined,
    );

    // Hydrogen Bottling Section (if we have a relevant bottling in context)
    const bottlingForSection = entryBottling ?? bottlingNodes[0]?.processStep;
    sectionPromises.push(bottlingForSection ? this.hydrogenBottlingSectionService.buildSection(bottlingForSection) : undefined);

    // Hydrogen Transportation Section (only with both transportation and its bottling)
    const transportationForSection = entryTransportation ?? transportationNodes[0]?.processStep;
    sectionPromises.push(
      transportationForSection && bottlingForSection
        ? this.hydrogenTransportationSectionService.buildSection(transportationForSection, bottlingForSection)
        : undefined,
    );

    const sections = (await Promise.all(sectionPromises)).filter((s) => !!s) as SectionDto[];
    return sections;
  }

  async buildProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityDto> {
    // Graph-first: only build the provenance graph
    const graphDto: ProvenanceGraphDto = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_GRAPH, {
        rootId: processStepId,
        direction: 'BOTH',
        maxDepth: 50,
        maxNodes: 5000,
      }),
    );

    const graph = ProvenanceGraph.fromDto(graphDto);
    const result: EmissionComputationResultDto = await this.emissionComputationService.computeGraphEmissions(
      graph,
      processStepId,
    );

    return new ProofOfSustainabilityDto(
      processStepId,
      result.amountCO2PerMJH2,
      result.emissionReductionPercentage,
      result.calculations,
      result.processStepEmissions,
    );
  }
}
