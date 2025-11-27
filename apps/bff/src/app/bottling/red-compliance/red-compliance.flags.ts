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

export function areUnitsInSameBiddingZone(
  powerUnit: PowerProductionUnitEntity,
  hydrogenUnit: HydrogenProductionUnitEntity,
): boolean {
  const powerUnitZone: BiddingZone = powerUnit.biddingZone;
  const hydrogenUnitZone: BiddingZone = hydrogenUnit.biddingZone;
  if (powerUnitZone == null || hydrogenUnitZone == null) {
    throw new HttpException('Missing biddingZone on power or hydrogen unit', HttpStatus.BAD_REQUEST);
  }
  return powerUnitZone === hydrogenUnitZone;
}

export function isWithinTimeCorrelation(
  powerProduction: ProcessStepEntity,
  hydrogenProduction: ProcessStepEntity,
): boolean {
  const powerStartedAt = new Date(powerProduction.startedAt);
  const hydrogenStartedAt = new Date(hydrogenProduction.startedAt);
  if (Number.isNaN(powerStartedAt.getTime()) || Number.isNaN(hydrogenStartedAt.getTime())) {
    throw new HttpException('Invalid startedAt on power or hydrogen production step', HttpStatus.BAD_REQUEST);
  }
  // Rounding to the nearest hour and comparing
  return powerStartedAt.setMinutes(0, 0, 0) === hydrogenStartedAt.setMinutes(0, 0, 0);
}

export function meetsAdditionalityCriterion(
  powerUnit: PowerProductionUnitEntity,
  hydrogenUnit: HydrogenProductionUnitEntity,
): boolean {
  const powerCommissioning = new Date(powerUnit.commissionedOn);
  const hydrogenCommissioning = new Date(hydrogenUnit.commissionedOn);
  if (Number.isNaN(powerCommissioning.getTime()) || Number.isNaN(hydrogenCommissioning.getTime())) {
    throw new HttpException('Invalid commissionedOn on power or hydrogen unit', HttpStatus.BAD_REQUEST);
  }

  // Limit date: 36 months prior to commissioning of the electrolyzer
  const limitDate = new Date(hydrogenCommissioning);
  limitDate.setMonth(limitDate.getMonth() - 36);
  // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
  return powerCommissioning >= limitDate;
}

export function hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
  return powerUnit.financialSupportReceived;
}
