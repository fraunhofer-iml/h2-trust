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
  ProvenanceEntity,
  ProvenanceMessagePatterns,
} from '@h2-trust/amqp';
import {RedComplianceDto,} from '@h2-trust/api';
import { areUnitsInSameBiddingZone, hasFinancialSupport, isAdditionality, isWithinTimeCorrelation } from './red-compliance.flags';
import { RedCompliancePairingService } from './red-compliance.pairs.service';
import { MatchedProductionPair } from './matched-production-pair';

@Injectable()
export class RedComplianceService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly pairingService: RedCompliancePairingService,
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
    const pairs: MatchedProductionPair[] = await this.pairingService.buildMatchedPairs(
      provenance.powerProductions,
      provenance.hydrogenProductions,
      processStepId,
    );

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
      isAdditionalityFulfilled &&= isAdditionality(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= hasFinancialSupport(powerProductionUnit);

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

}
