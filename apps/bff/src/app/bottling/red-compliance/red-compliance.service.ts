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
import { BrokerQueues, ProvenanceMessagePatterns, ProvenanceGraphDto } from '@h2-trust/amqp';
import { RedComplianceDto } from '@h2-trust/api';
import { MatchedProductionPair } from './matched-production-pair';
import {
  areUnitsInSameBiddingZone,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from './red-compliance.flags';
import { RedCompliancePairingService } from './red-compliance.pairs.service';
import { ProvenanceGraph } from '../../provenance/provenance-graph';

@Injectable()
export class RedComplianceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly pairingService: RedCompliancePairingService,
  ) {}

  async determineRedCompliance(processStepId: string): Promise<RedComplianceDto> {
    // Graph-first: Only build the graph; no Provenance view required
    const graphDto: ProvenanceGraphDto = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_GRAPH, {
        rootId: processStepId,
        direction: 'BOTH',
        maxDepth: 50,
        maxNodes: 5000,
      }),
    );

    if (!graphDto?.nodes?.length) {
      const message = `Graph is missing for processStepId [${processStepId}]`;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    // Build in-memory traversal graph directly from Graph DTO meta
    const graph = ProvenanceGraph.fromDto(graphDto);

    const pairs: MatchedProductionPair[] = await this.pairingService.buildMatchedPairs(graph);

    return this.evaluateCompliance(pairs);
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

    return new RedComplianceDto(
      isGeoCorrelationValid,
      isTimeCorrelationValid,
      isAdditionalityFulfilled,
      isFinancialSupportReceived,
    );
  }
}
