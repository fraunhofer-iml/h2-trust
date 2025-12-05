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
import {
  BrokerQueues,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionComputationResultDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionCalculationAssembler } from './emission.assembler';
import { ProvenanceGraph } from '../../provenance/provenance-graph';

@Injectable()
export class EmissionComputationService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy) {}

  async computeProvenanceEmissions(provenance: ProvenanceEntity): Promise<EmissionComputationResultDto> {
    const emissionCalculations: EmissionCalculationDto[] = [];

    if (provenance.powerProductions) {
      const powerProductions: EmissionCalculationDto[] = await this.computePowerSupplyEmissions(
        provenance.powerProductions,
      );
      emissionCalculations.push(...powerProductions);
    }

    if (provenance.waterConsumptions) {
      const waterConsumptions: EmissionCalculationDto[] = provenance.waterConsumptions.map((waterConsumption) =>
        EmissionCalculationAssembler.assembleWaterSupplyCalculation(waterConsumption),
      );
      emissionCalculations.push(...waterConsumptions);
    }

    if (provenance.hydrogenProductions) {
      const hydrogenStorages: EmissionCalculationDto[] = provenance.hydrogenProductions.map((hydrogenProduction) =>
        EmissionCalculationAssembler.assembleHydrogenStorageCalculation(
          hydrogenProduction.batch.amount,
          provenance.hydrogenProductions,
        ),
      );
      emissionCalculations.push(...hydrogenStorages);
    }

    if (provenance.hydrogenBottling) {
      const hydrogenBottling: EmissionCalculationDto = EmissionCalculationAssembler.assembleHydrogenBottlingCalculation(
        provenance.hydrogenBottling,
      );
      emissionCalculations.push(hydrogenBottling);
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      const hydrogenTransportation: EmissionCalculationDto =
        EmissionCalculationAssembler.assembleHydrogenTransportationCalculation(provenance.root);
      emissionCalculations.push(hydrogenTransportation);
    }

    return EmissionCalculationAssembler.assembleComputationResult(emissionCalculations);
  }

  async computePowerSupplyEmissions(powerProductions: ProcessStepEntity[]): Promise<EmissionCalculationDto[]> {
    if (!powerProductions.length) {
      return [];
    }

    const unitIds = Array.from(new Set(powerProductions.map((p) => p.executedBy.id)));

    const units: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, { ids: unitIds }),
    );

    const unitsById = new Map<string, PowerProductionUnitEntity>(units.map((u) => [u.id, u]));
    for (const unitId of unitIds) {
      if (!unitsById.has(unitId)) {
        throw new Error(`PowerProductionUnit [${unitId}] not found.`);
      }
    }

    return powerProductions.map((powerProduction) => {
      const unit = unitsById.get(powerProduction.executedBy.id)!;
      return EmissionCalculationAssembler.assemblePowerSupplyCalculation(powerProduction, unit.type.energySource);
    });
  }

  // New: Graph-based emissions computation (Graph-first)
  async computeGraphEmissions(graph: ProvenanceGraph, rootId: string): Promise<EmissionComputationResultDto> {
    const emissionCalculations: EmissionCalculationDto[] = [];

    // Power supply
    const powerNodes = graph.nodesOfType(ProcessType.POWER_PRODUCTION as unknown as string);
    if (powerNodes.length) {
      const powerProductions = powerNodes.map((n) => n.processStep).filter(Boolean) as ProcessStepEntity[];
      const powerCalcs = await this.computePowerSupplyEmissions(powerProductions);
      emissionCalculations.push(...powerCalcs);
    }

    // Water supply
    const waterNodes = graph.nodesOfType(ProcessType.WATER_CONSUMPTION as unknown as string);
    for (const wn of waterNodes) {
      emissionCalculations.push(EmissionCalculationAssembler.assembleWaterSupplyCalculation(wn.processStep));
    }

    // Hydrogen storage (per hydrogen production)
    const hydrogenNodes = graph.nodesOfType(ProcessType.HYDROGEN_PRODUCTION as unknown as string);
    if (hydrogenNodes.length) {
      const hydrogenSteps = hydrogenNodes.map((n) => n.processStep) as ProcessStepEntity[];
      for (const hn of hydrogenNodes) {
        emissionCalculations.push(
          EmissionCalculationAssembler.assembleHydrogenStorageCalculation(
            Number(hn.processStep?.batch?.amount ?? 0),
            hydrogenSteps,
          ),
        );
      }
    }

    // Hydrogen bottling (nearest relevant in scope)
    const bottlingNodes = graph.nodesOfType(ProcessType.HYDROGEN_BOTTLING as unknown as string);
    if (bottlingNodes.length) {
      // If multiple exist in the subgraph slice, include the one nearest to the root upstream or downstream
      const root = graph.getNodeByProcessStepId(rootId);
      let chosen = bottlingNodes[0];
      if (root) {
        const nearestUp = graph.nearestUpstreamOfType(root, ProcessType.HYDROGEN_BOTTLING as unknown as string);
        chosen = nearestUp ?? chosen;
      }
      emissionCalculations.push(
        EmissionCalculationAssembler.assembleHydrogenBottlingCalculation(chosen.processStep),
      );
    }

    // Transportation (only if root is transportation)
    const rootNode = graph.getNodeByProcessStepId(rootId);
    if (rootNode && rootNode.processStep?.type === (ProcessType.HYDROGEN_TRANSPORTATION as unknown as string)) {
      emissionCalculations.push(
        EmissionCalculationAssembler.assembleHydrogenTransportationCalculation(rootNode.processStep),
      );
    }

    return EmissionCalculationAssembler.assembleComputationResult(emissionCalculations);
  }
}
