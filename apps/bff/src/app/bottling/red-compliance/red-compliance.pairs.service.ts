/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { MatchedProductionPair } from './matched-production-pair';

@Injectable()
export class RedCompliancePairingService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy) {}

  async buildMatchedPairs(
    powerProductions: ProcessStepEntity[],
    hydrogenProductions: ProcessStepEntity[],
    processStepId: string,
  ): Promise<MatchedProductionPair[]> {
    const pairs: MatchedProductionPair[] = this.buildMatchedPairsWithoutUnits(powerProductions, hydrogenProductions);

    if (pairs.length === 0) {
      const message = `No matching power↔hydrogen production pairs found for processStepId [${processStepId}]`;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return await this.enrichPairsWithUnits(pairs);
  }

  private buildMatchedPairsWithoutUnits(
    powerProductions: ProcessStepEntity[],
    hydrogenProductions: ProcessStepEntity[],
  ): MatchedProductionPair[] {
    const hydrogenProductionById = this.buildHydrogenProductionById(hydrogenProductions);
    const pairs: MatchedProductionPair[] = [];
    for (const powerProduction of powerProductions) {
      const successor = powerProduction.batch?.successors?.find((s) => hydrogenProductionById.has(s.processStepId));
      if (successor) {
        const hydrogenProduction = hydrogenProductionById.get(successor.processStepId)!;
        pairs.push({
          power: { processStep: powerProduction },
          hydrogen: { processStep: hydrogenProduction },
        });
      }
    }
    return pairs;
  }

  private buildHydrogenProductionById(hydrogenProductions: ProcessStepEntity[]): Map<string, ProcessStepEntity> {
    const map = new Map<string, ProcessStepEntity>();
    for (const hydrogenProduction of hydrogenProductions) {
      map.set(hydrogenProduction.id, hydrogenProduction);
    }
    return map;
  }

  private async enrichPairsWithUnits(pairs: MatchedProductionPair[]): Promise<MatchedProductionPair[]> {
    const { uniquePowerUnitIds, uniqueHydrogenUnitIds } = this.collectUniqueUnitIdsFromPairs(pairs);
    const { powerUnitById, hydrogenUnitById } = await this.loadProductionUnits(
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

  private async loadProductionUnits(
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
