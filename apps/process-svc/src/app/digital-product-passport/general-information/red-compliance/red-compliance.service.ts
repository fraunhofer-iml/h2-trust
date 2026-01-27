/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ProvenanceEntity, RedComplianceEntity } from '@h2-trust/amqp';
import { ProvenanceService } from '../../provenance/provenance.service';
import { MatchedProductionPair } from './matched-production-pair';
import { RedCompliancePairingService } from './red-compliance-pairing.service';
import {
  areUnitsInSameBiddingZone,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from './red-compliance.flags';

@Injectable()
export class RedComplianceService {
  constructor(
    private readonly redCompliancePairingService: RedCompliancePairingService,
    private readonly provenanceService: ProvenanceService,
  ) {}

  async determineRedCompliance(processStepId: string): Promise<RedComplianceEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStepId);

    if (!provenance || !provenance.powerProductions?.length || !provenance.hydrogenProductions?.length) {
      throw new RpcException(
        `Provenance or required productions (power/hydrogen) are missing for processStepId [${processStepId}]`,
      );
    }

    const pairs: MatchedProductionPair[] = await this.redCompliancePairingService.buildMatchedPairs(
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
      const powerProductionUnit = pair.power.unit;
      const hydrogenProductionUnit = pair.hydrogen.unit;

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
}
