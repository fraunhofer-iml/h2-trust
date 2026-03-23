/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { MatchedProductionPair } from './matched-production-pair';
import {
  areUnitsInSameBiddingZone,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from './red-compliance.flags';

@Injectable()
export class RedComplianceService {
  determineRedCompliance(processStepId: string, provenance: ProvenanceEntity): RedComplianceEntity {
    if (!provenance || !provenance.powerProductions?.length || !provenance.hydrogenProductions?.length) {
      throw new RpcException(
        `Provenance or required productions (power/hydrogen) are missing for processStepId [${processStepId}]`,
      );
    }

    const pairs: MatchedProductionPair[] = this.buildMatchedPairs(
      provenance.powerProductions,
      provenance.hydrogenProductions,
      processStepId,
    );

    return this.evaluateCompliance(pairs);
  }

  private evaluateCompliance(pairs: MatchedProductionPair[]): RedComplianceEntity {
    let isGeoCorrelationValid = true;
    let isTimeCorrelationValid = true;
    let isAdditionalityFulfilled = true;
    let isFinancialSupportReceived = true;

    for (const pair of pairs) {
      const powerProductionUnit = pair.power.processStep.executedBy as PowerProductionUnitEntity;
      const hydrogenProductionUnit = pair.hydrogen.processStep.executedBy as HydrogenProductionUnitEntity;

      if (!powerProductionUnit || !hydrogenProductionUnit) {
        const expectedPowerUnitId = pair.power.processStep.executedBy?.id;
        const expectedHydrogenUnitId = pair.hydrogen.processStep.executedBy?.id;
        throw new HttpException(
          `Production units not found: powerUnitId [${expectedPowerUnitId}] or hydrogenUnitId [${expectedHydrogenUnitId}]`,
          HttpStatus.BAD_REQUEST,
        );
      }

      isGeoCorrelationValid &&= areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
      isTimeCorrelationValid &&= isWithinTimeCorrelation(pair.power.processStep, pair.hydrogen.processStep);
      isAdditionalityFulfilled &&= meetsAdditionalityCriterion(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= hasFinancialSupport(powerProductionUnit);

      if (
        !isGeoCorrelationValid &&
        !isTimeCorrelationValid &&
        !isAdditionalityFulfilled &&
        !isFinancialSupportReceived
      ) {
        break;
      }
    }

    return new RedComplianceEntity(
      isGeoCorrelationValid,
      isTimeCorrelationValid,
      isAdditionalityFulfilled,
      isFinancialSupportReceived,
    );
  }

  buildMatchedPairs(
    powerProcessSteps: ProcessStepEntity[],
    hydrogenProcessSteps: ProcessStepEntity[],
    _processStepId: string,
  ): MatchedProductionPair[] {
    const pairs: MatchedProductionPair[] = this.buildMatchedPairsWithoutUnits(powerProcessSteps, hydrogenProcessSteps);

    if (!pairs?.length) {
      return [];
      // TODO throw exception when matching is solved in long chains
      // const message = `No matching power↔hydrogen production pairs found for processStepId [${processStepId}]`;
      // throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return pairs.map((pair) => ({
      power: {
        processStep: pair.power.processStep,
      },
      hydrogen: {
        processStep: pair.hydrogen.processStep,
      },
    }));
  }
  private buildMatchedPairsWithoutUnits(
    powerProcessSteps: ProcessStepEntity[],
    hydrogenProcessSteps: ProcessStepEntity[],
  ): MatchedProductionPair[] {
    const hydrogenProductionById = this.buildHydrogenProcessStepsById(hydrogenProcessSteps);
    const pairs: MatchedProductionPair[] = [];
    for (const powerProduction of powerProcessSteps) {
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

  private buildHydrogenProcessStepsById(processSteps: ProcessStepEntity[]): Map<string, ProcessStepEntity> {
    const map = new Map<string, ProcessStepEntity>();
    for (const processStep of processSteps) {
      map.set(processStep.id, processStep);
    }
    return map;
  }
}
