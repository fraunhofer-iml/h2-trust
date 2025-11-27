/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {firstValueFrom} from 'rxjs';
import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {
  BrokerQueues,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  ProvenanceMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {RedComplianceDto,} from '@h2-trust/api';
import {BiddingZone} from "@h2-trust/domain";

interface MatchedProductionPair {
  power: {
    processStep: ProcessStepEntity;
    unit?: PowerProductionUnitEntity;
  };
  hydrogen: {
    processStep: ProcessStepEntity;
    unit?: HydrogenProductionUnitEntity;
  };
}

@Injectable()
export class RedComplianceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
  ) {
  }

  async determineRedCompliance(processStepId: string): Promise<RedComplianceDto> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, {processStepId}),
    );
    if (!provenance || !provenance.powerProductions?.length || !provenance.hydrogenProductions?.length) {
      const message = `Provenance or required productions (power/hydrogen) are missing for processStepId [${processStepId}]`;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
    const pairs: MatchedProductionPair[] = await this.buildMatchedPairs(provenance.powerProductions, provenance.hydrogenProductions, processStepId);

    return this.evaluateCompliance(pairs);
  }

  private async buildMatchedPairs(
    powerProductions: ProcessStepEntity[],
    hydrogenProductions: ProcessStepEntity[],
    processStepId: string
  ) {
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
          power: {processStep: powerProduction},
          hydrogen: {processStep: hydrogenProduction},
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

  private async enrichPairsWithUnits(
    pairs: MatchedProductionPair[],
  ): Promise<MatchedProductionPair[]> {
    const {uniquePowerUnitIds, uniqueHydrogenUnitIds} = this.collectUniqueUnitIdsFromPairs(pairs);
    const {powerUnitById, hydrogenUnitById} = await this.loadProductionUnits(uniquePowerUnitIds, uniqueHydrogenUnitIds);

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
    uniqueHydrogenUnitIds: string[]
  } {
    const uniquePowerUnitIds = Array.from(new Set(pairs.map((pair) => pair.power.processStep.executedBy.id)));
    const uniqueHydrogenUnitIds = Array.from(new Set(pairs.map((pair) => pair.hydrogen.processStep.executedBy.id)));
    return {uniquePowerUnitIds, uniqueHydrogenUnitIds};
  }

  private async loadProductionUnits(
    powerUnitIds: string[],
    hydrogenUnitIds: string[],
  ): Promise<{
    powerUnitById: Map<string, PowerProductionUnitEntity>;
    hydrogenUnitById: Map<string, HydrogenProductionUnitEntity>
  }> {
    const [powerProductionUnitEntities, hydrogenProductionUnitEntities] = await Promise.all([
      firstValueFrom(this.generalSvc.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS, {ids: powerUnitIds})),
      firstValueFrom(this.generalSvc.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS, {ids: hydrogenUnitIds})),
    ]);

    const powerUnitById = new Map<string, PowerProductionUnitEntity>();
    for (const unit of powerProductionUnitEntities) powerUnitById.set(unit.id, unit);
    const hydrogenUnitById = new Map<string, HydrogenProductionUnitEntity>();
    for (const unit of hydrogenProductionUnitEntities) hydrogenUnitById.set(unit.id, unit);

    return {powerUnitById, hydrogenUnitById};
  }

  private evaluateCompliance(pairs: MatchedProductionPair[]): RedComplianceDto {
    let isGeoCorrelationValid = true;
    let isTimeCorrelationValid = true;
    let isAdditionalityFulfilled = true;
    let isFinancialSupportReceived = true;

    for (const pair of pairs) {
      const powerProductionUnit = pair.power.unit;
      const hydrogenProductionUnit = pair.hydrogen.unit;

      if (!powerProductionUnit || !hydrogenProductionUnit) {
        const expectedPowerUnitId = pair.power.processStep.executedBy?.id;
        const expectedHydrogenUnitId = pair.hydrogen.processStep.executedBy?.id;
        const message = `Production units not found: powerUnitId [${expectedPowerUnitId}] or hydrogenUnitId [${expectedHydrogenUnitId}]`;
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }

      isGeoCorrelationValid &&= this.areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
      isTimeCorrelationValid &&= this.isWithinTimeCorrelation(pair.power.processStep, pair.hydrogen.processStep);
      isAdditionalityFulfilled &&= this.isAdditionality(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= this.hasFinancialSupport(powerProductionUnit);

      if (!isGeoCorrelationValid && !isTimeCorrelationValid && !isAdditionalityFulfilled && !isFinancialSupportReceived) {
        break;
      }
    }

    return new RedComplianceDto(
      isGeoCorrelationValid,
      isTimeCorrelationValid,
      isAdditionalityFulfilled,
      isFinancialSupportReceived,
    );
  }

  private areUnitsInSameBiddingZone(
    powerUnit: PowerProductionUnitEntity,
    hydrogenUnit: HydrogenProductionUnitEntity,
  ): boolean {
    const powerUnitZone: BiddingZone = powerUnit.biddingZone;
    const hydrogenUnitZone: BiddingZone = hydrogenUnit.biddingZone;
    if (powerUnitZone == null || hydrogenUnitZone == null) {
      throw new HttpException(
        'Missing biddingZone on power or hydrogen unit',
        HttpStatus.BAD_REQUEST,
      );
    }
    return powerUnitZone === hydrogenUnitZone;
  }

  private isWithinTimeCorrelation(
    powerProduction: ProcessStepEntity,
    hydrogenProduction: ProcessStepEntity,
  ): boolean {
    const powerStartedAt = new Date(powerProduction.startedAt);
    const hydrogenStartedAt = new Date(hydrogenProduction.startedAt);
    if (Number.isNaN(powerStartedAt.getTime()) || Number.isNaN(hydrogenStartedAt.getTime())) {
      throw new HttpException(
        'Invalid startedAt on power or hydrogen production step',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Rounding to the nearest hour and comparing
    return powerStartedAt.setMinutes(0, 0, 0) === hydrogenStartedAt.setMinutes(0, 0, 0);
  }

  private isAdditionality(
    powerUnit: PowerProductionUnitEntity,
    hydrogenUnit: HydrogenProductionUnitEntity,
  ): boolean {
    const powerCommissioning = new Date(powerUnit.commissionedOn);
    const hydrogenCommissioning = new Date(hydrogenUnit.commissionedOn);
    if (Number.isNaN(powerCommissioning.getTime()) || Number.isNaN(hydrogenCommissioning.getTime())) {
      throw new HttpException(
        'Invalid commissionedOn on power or hydrogen unit',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Limit date: 36 months prior to commissioning of the electrolyzer
    const limitDate = new Date(hydrogenCommissioning);
    limitDate.setMonth(limitDate.getMonth() - 36);
    // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
    return powerCommissioning >= limitDate;
  }

  private hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
    return powerUnit.financialSupportReceived;
  }
}
