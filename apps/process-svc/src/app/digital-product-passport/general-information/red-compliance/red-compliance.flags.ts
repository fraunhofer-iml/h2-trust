/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { HydrogenProductionUnitEntity, PowerProductionUnitEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { BiddingZone } from '@h2-trust/domain';
import { assertBoolean, assertDefined, DateTimeUtil } from '@h2-trust/utils';

export function areUnitsInSameBiddingZone(
  powerUnit: PowerProductionUnitEntity,
  hydrogenUnit: HydrogenProductionUnitEntity,
): boolean {
  const powerUnitZone: BiddingZone = powerUnit?.biddingZone;
  const hydrogenUnitZone: BiddingZone = hydrogenUnit?.biddingZone;
  assertValidBiddingZone(powerUnitZone, 'powerUnit.biddingZone');
  assertValidBiddingZone(hydrogenUnitZone, 'hydrogenUnit.biddingZone');
  return powerUnitZone === hydrogenUnitZone;
}

export function isWithinTimeCorrelation(
  powerProduction: ProcessStepEntity,
  hydrogenProduction: ProcessStepEntity,
): boolean {
  const powerStartedAt = DateTimeUtil.toValidDate(powerProduction?.startedAt, 'powerProduction.startedAt');
  const hydrogenStartedAt = DateTimeUtil.toValidDate(hydrogenProduction?.startedAt, 'hydrogenProduction.startedAt');

  // Rounding to the same hour and comparing
  const msPerHour = 60 * 60 * 1000;
  const powerHour = Math.floor(powerStartedAt.getTime() / msPerHour);
  const hydrogenHour = Math.floor(hydrogenStartedAt.getTime() / msPerHour);
  return powerHour === hydrogenHour;
}

export function meetsAdditionalityCriterion(
  powerUnit: PowerProductionUnitEntity,
  hydrogenUnit: HydrogenProductionUnitEntity,
): boolean {
  const powerCommissioning = DateTimeUtil.toValidDate(powerUnit?.commissionedOn, 'powerUnit.commissionedOn');
  const hydrogenCommissioning = DateTimeUtil.toValidDate(hydrogenUnit?.commissionedOn, 'hydrogenUnit.commissionedOn');

  // Limit date: 36 months prior to commissioning of the electrolyzer
  const limitDate = DateTimeUtil.subtractMonthsSafe(hydrogenCommissioning, 36);

  // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
  return powerCommissioning >= limitDate;
}

export function hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
  assertBoolean(powerUnit?.financialSupportReceived, 'powerUnit.financialSupportReceived');
  return !powerUnit.financialSupportReceived; // TODO-MP: change in data model
}

function assertValidBiddingZone(zone: unknown, name: string): asserts zone is BiddingZone {
  assertDefined(zone, name);
  if (!Object.values(BiddingZone).includes(zone as BiddingZone)) {
    const message = `Invalid BiddingZone: ${name}: ${zone}`;
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
