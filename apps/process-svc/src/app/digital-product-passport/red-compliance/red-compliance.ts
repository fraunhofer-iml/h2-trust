/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  RedComplianceEntity,
} from '@h2-trust/contracts/entities';
import { BiddingZone } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';
import { assertBoolean, assertDefined, subtractMonthsSafe, toValidDate } from '@h2-trust/utils';

export function determineRedCompliance(
  hydrogenProduction: ProcessStepEntity,
  powerProduction: ProcessStepEntity,
): RedComplianceEntity {
  if (!hydrogenProduction?.executedBy || !powerProduction?.executedBy) {
    throw new InternalException(
      'The passed-in power production or hydrogen production do not have an executedBy unit specified.',
    );
  }
  const powerProductionUnit: PowerProductionUnitEntity = powerProduction.executedBy as PowerProductionUnitEntity;
  const hydrogenProductionUnit: HydrogenProductionUnitEntity =
    hydrogenProduction.executedBy as HydrogenProductionUnitEntity;

  const isGeoCorrelationValid = areUnitsInSameBiddingZone(powerProductionUnit, hydrogenProductionUnit);
  const isTimeCorrelationValid = isWithinTimeCorrelation(powerProduction, hydrogenProduction);
  const isAdditionalityFulfilled = meetsAdditionalityCriterion(powerProductionUnit, hydrogenProductionUnit);
  const isFinancialSupportReceived = hasFinancialSupport(powerProductionUnit);

  return new RedComplianceEntity(
    isGeoCorrelationValid,
    isTimeCorrelationValid,
    isAdditionalityFulfilled,
    isFinancialSupportReceived,
  );
}

export function determineTotalRedCompliance(productionChains: ProductionChainEntity[]): RedComplianceEntity {
  let isGeoCorrelationValid = true;
  let isTimeCorrelationValid = true;
  let isAdditionalityFulfilled = true;
  let isFinancialSupportReceived = true;

  for (const productionChain of productionChains) {
    isGeoCorrelationValid &&= areUnitsInSameBiddingZone(
      productionChain.powerProductionUnit,
      productionChain.hydrogenProductionUnit,
    );
    isTimeCorrelationValid &&= isWithinTimeCorrelation(
      productionChain.powerProduction,
      productionChain.hydrogenRootProduction,
    );
    isAdditionalityFulfilled &&= meetsAdditionalityCriterion(
      productionChain.powerProductionUnit,
      productionChain.hydrogenProductionUnit,
    );
    isFinancialSupportReceived &&= hasFinancialSupport(productionChain.powerProductionUnit);
  }
  return new RedComplianceEntity(
    isGeoCorrelationValid,
    isTimeCorrelationValid,
    isAdditionalityFulfilled,
    isFinancialSupportReceived,
  );
}

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
  const powerStartedAt = toValidDate(powerProduction?.startedAt, 'powerProduction.startedAt');
  const hydrogenStartedAt = toValidDate(hydrogenProduction?.startedAt, 'hydrogenProduction.startedAt');

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
  const powerCommissioning = toValidDate(powerUnit?.commissionedOn, 'powerUnit.commissionedOn');
  const hydrogenCommissioning = toValidDate(hydrogenUnit?.commissionedOn, 'hydrogenUnit.commissionedOn');

  // Limit date: 36 months prior to commissioning of the hydrogen production unit
  const limitDate = subtractMonthsSafe(hydrogenCommissioning, 36);

  // Power generation must not occur BEFORE this limit date (i.e., it must be >=).
  return powerCommissioning >= limitDate;
}

export function hasFinancialSupport(powerUnit: PowerProductionUnitEntity): boolean {
  assertBoolean(powerUnit?.financialSupportReceived, 'powerUnit.financialSupportReceived');
  return !powerUnit.financialSupportReceived;
}

export function assertValidBiddingZone(zone: unknown, name: string): asserts zone is BiddingZone {
  assertDefined(zone, name);
  if (!Object.values(BiddingZone).includes(zone as BiddingZone)) {
    throw new InternalException(`Invalid BiddingZone: ${name}: ${zone}`);
  }
}
