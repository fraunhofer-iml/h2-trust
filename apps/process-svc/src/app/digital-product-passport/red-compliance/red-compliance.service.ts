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
  BatchEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { BatchType, BiddingZone } from '@h2-trust/domain';
import { assertBoolean, assertDefined, DateTimeUtil } from '@h2-trust/utils';

@Injectable()
export class RedComplianceService {
  public determineRedCompliance(
    powerProductions: ProcessStepEntity[],
    hydrogenRootProductions: ProcessStepEntity[],
  ): RedComplianceEntity {
    if (!powerProductions?.length || !hydrogenRootProductions?.length) {
      throw new RpcException(
        `The required productions (power/hydrogen) for the Red compliance calculation are missing.`,
      );
    }

    let isGeoCorrelationValid = true;
    let isTimeCorrelationValid = true;
    let isAdditionalityFulfilled = true;
    let isFinancialSupportReceived = true;

    for (const hydrogenProductionProcessStep of hydrogenRootProductions) {
      const powerProductionBatch: BatchEntity = hydrogenProductionProcessStep.batch.predecessors.find(
        (pred) => pred.type == BatchType.POWER,
      );
      const powerProductionProcessStep: ProcessStepEntity = powerProductions.find(
        (powerProduction) => powerProduction.id === powerProductionBatch.processStepId,
      );

      const powerProductionUnit: PowerProductionUnitEntity =
        powerProductionProcessStep.executedBy as PowerProductionUnitEntity;
      const hydrogenProductionUnit: HydrogenProductionUnitEntity =
        hydrogenProductionProcessStep.executedBy as HydrogenProductionUnitEntity;

      isGeoCorrelationValid &&= this.areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
      isTimeCorrelationValid &&= this.isWithinTimeCorrelation(
        powerProductionProcessStep,
        hydrogenProductionProcessStep,
      );
      isAdditionalityFulfilled &&= this.meetsAdditionalityCriterion(powerProductionUnit, hydrogenProductionUnit);
      isFinancialSupportReceived &&= this.hasFinancialSupport(powerProductionUnit);
    }
    return new RedComplianceEntity(
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
    const powerUnitZone: BiddingZone = powerUnit?.biddingZone;
    const hydrogenUnitZone: BiddingZone = hydrogenUnit?.biddingZone;
    this.assertValidBiddingZone(powerUnitZone, 'powerUnit.biddingZone');
    this.assertValidBiddingZone(hydrogenUnitZone, 'hydrogenUnit.biddingZone');
    return powerUnitZone === hydrogenUnitZone;
  }

  private isWithinTimeCorrelation(powerProduction: ProcessStepEntity, hydrogenProduction: ProcessStepEntity): boolean {
    const powerStartedAt = DateTimeUtil.toValidDate(powerProduction?.startedAt, 'powerProduction.startedAt');
    const hydrogenStartedAt = DateTimeUtil.toValidDate(hydrogenProduction?.startedAt, 'hydrogenProduction.startedAt');

    // Rounding to the same hour and comparing
    const msPerHour = 60 * 60 * 1000;
    const powerHour = Math.floor(powerStartedAt.getTime() / msPerHour);
    const hydrogenHour = Math.floor(hydrogenStartedAt.getTime() / msPerHour);
    return powerHour === hydrogenHour;
  }

  private meetsAdditionalityCriterion(
    powerUnit: PowerProductionUnitEntity,
    hydrogenUnit: HydrogenProductionUnitEntity,
  ): boolean {
    const powerCommissioning = DateTimeUtil.toValidDate(powerUnit?.commissionedOn, 'powerUnit.commissionedOn');
    const hydrogenCommissioning = DateTimeUtil.toValidDate(hydrogenUnit?.commissionedOn, 'hydrogenUnit.commissionedOn');

    // Limit date: 36 months prior to commissioning of the hydrogen production unit
    const limitDate = DateTimeUtil.subtractMonthsSafe(hydrogenCommissioning, 36);

    // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
    return powerCommissioning >= limitDate;
  }

  private hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
    assertBoolean(powerUnit?.financialSupportReceived, 'powerUnit.financialSupportReceived');
    return !powerUnit.financialSupportReceived;
  }

  private assertValidBiddingZone(zone: unknown, name: string): asserts zone is BiddingZone {
    assertDefined(zone, name);
    if (!Object.values(BiddingZone).includes(zone as BiddingZone)) {
      throw new HttpException(`Invalid BiddingZone: ${name}: ${zone}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
