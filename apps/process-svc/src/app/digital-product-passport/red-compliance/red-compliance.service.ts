/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  BatchEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import {
  areUnitsInSameBiddingZone,
  hasFinancialSupport,
  isWithinTimeCorrelation,
  meetsAdditionalityCriterion,
} from './red-compliance.flags';

@Injectable()
export class RedComplianceService {
  determineRedCompliance(provenance: ProvenanceEntity): RedComplianceEntity {
    if (!provenance || !provenance.powerProductions?.length || !provenance.hydrogenRootProductions?.length) {
      throw new RpcException(
        `Provenance or required productions (power/hydrogen) are missing for processStepId [${provenance.root.id}]`,
      );
    }

    let isGeoCorrelationValid = true;
    let isTimeCorrelationValid = true;
    let isAdditionalityFulfilled = true;
    let isFinancialSupportReceived = true;

    for (const hydrogenProductionProcessStep of provenance.hydrogenRootProductions) {
      const powerProductionBatch: BatchEntity = hydrogenProductionProcessStep.batch.predecessors.find(
        (pred) => pred.type == BatchType.POWER,
      );
      const powerProductionProcessStep: ProcessStepEntity = provenance.powerProductions.find(
        (powerProduction) => powerProduction.id === powerProductionBatch.processStepId,
      );

      const powerProductionUnit: PowerProductionUnitEntity =
        powerProductionProcessStep.executedBy as PowerProductionUnitEntity;
      const hydrogenProductionUnit: HydrogenProductionUnitEntity =
        hydrogenProductionProcessStep.executedBy as HydrogenProductionUnitEntity;

      isGeoCorrelationValid &&= areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
      isTimeCorrelationValid &&= isWithinTimeCorrelation(powerProductionProcessStep, hydrogenProductionProcessStep);
      isAdditionalityFulfilled &&= meetsAdditionalityCriterion(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= hasFinancialSupport(powerProductionUnit);
    }
    return new RedComplianceEntity(
      isGeoCorrelationValid,
      isTimeCorrelationValid,
      isAdditionalityFulfilled,
      isFinancialSupportReceived,
    );
  }
}
