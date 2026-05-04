/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, CreateProductionEntity, ProcessStepEntity } from '@h2-trust/contracts/entities';
import { EnergySource, PowerType, RenewableShareInGridMix, TimeInSeconds } from '@h2-trust/domain';
import { convertDateToMilliseconds, convertDateToSeconds } from '@h2-trust/utils';
import { AccountingPeriod } from '../production.types';

export function calculateNumberOfAccountingPeriods(
  startedAtInSeconds: number,
  endedAtInSeconds: number,
  accountingPeriodInSeconds: number,
): number {
  const durationInSeconds = calculateDuration(startedAtInSeconds, endedAtInSeconds);

  if (!Number.isFinite(accountingPeriodInSeconds)) {
    throw new Error(`accountingPeriodInSeconds must be a finite number: ${accountingPeriodInSeconds}`);
  }

  if (accountingPeriodInSeconds <= 0) {
    throw new Error('accountingPeriodInSeconds must be greater than zero');
  }

  return Math.ceil(durationInSeconds / accountingPeriodInSeconds);
}

export function calculateDuration(startedAtInSeconds: number, endedAtInSeconds: number) {
  const durationInSeconds = endedAtInSeconds - startedAtInSeconds;

  if (startedAtInSeconds < 0) {
    throw new Error('startedAtInSeconds must be positive');
  }

  if (endedAtInSeconds < 0) {
    throw new Error('endedAtInSeconds must be positive');
  }

  if (durationInSeconds <= 0) {
    throw new Error('endedAtInSeconds must be greater than startedAtInSeconds');
  }

  return durationInSeconds;
}

export function calculateBatchAmountPerAccountingPeriod(batchAmount: number, numberOfAccountingPeriods: number): number {
  if (batchAmount <= 0) {
    throw new Error('batchAmount must be greater than zero');
  }

  if (numberOfAccountingPeriods <= 0) {
    throw new Error('numberOfAccountingPeriods must be greater than zero');
  }

  return batchAmount / Math.max(1, numberOfAccountingPeriods);
}

export function calculateProductionStartDate(
  startedAtInSeconds: number,
  accountingPeriodInSeconds: number,
  accountingPeriodIndex: number,
): Date {
  return calculateProductionDate(startedAtInSeconds, accountingPeriodInSeconds, accountingPeriodIndex, false);
}

export function calculateProductionEndDate(
  startedAtInSeconds: number,
  accountingPeriodInSeconds: number,
  accountingPeriodIndex: number,
): Date {
  return calculateProductionDate(startedAtInSeconds, accountingPeriodInSeconds, accountingPeriodIndex, true);
}

export function calculateProductionDate(
  startedAtInSeconds: number,
  accountingPeriodInSeconds: number,
  accountingPeriodIndex: number,
  isEnd: boolean,
): Date {
  const productionStartedAtInMs = startedAtInSeconds * 1000;
  const accountingPeriodInMs = accountingPeriodInSeconds * 1000;
  const accountingPeriodOffsetInMs = (accountingPeriodIndex + (isEnd ? 1 : 0)) * accountingPeriodInMs;

  return new Date(
    isEnd
      ? productionStartedAtInMs + accountingPeriodOffsetInMs - 1000 // Subtract 1 second to ensure the end time is before the next period starts
      : productionStartedAtInMs + accountingPeriodOffsetInMs,
  );
}

export function calculateWaterAmount(startedAt: Date, endedAt: Date, waterConsumptionPerHour: number): number {
  if (waterConsumptionPerHour < 0) {
    throw new Error(`waterConsumptionPerHour must be non-negative: [${waterConsumptionPerHour}]`);
  }

  const startedAtInSeconds = convertDateToSeconds(startedAt);
  const endedAtInSeconds = convertDateToSeconds(endedAt);
  const durationInSeconds = calculateDuration(startedAtInSeconds, endedAtInSeconds);
  return (waterConsumptionPerHour / TimeInSeconds.ONE_HOUR) * durationInSeconds;
}

export function calculateAccountingPeriods(
  startedAt: Date,
  endedAt: Date,
  totalAmount: number,
  predecessors: ProcessStepEntity[],
): AccountingPeriod[] {
  const startInSeconds = convertDateToSeconds(startedAt);
  const endInSeconds = convertDateToSeconds(endedAt);
  const alignedStartInSeconds =
    Math.floor(startInSeconds / TimeInSeconds.ACCOUNTING_PERIOD) * TimeInSeconds.ACCOUNTING_PERIOD;

  const numberOfAccountingPeriods = calculateNumberOfAccountingPeriods(
    alignedStartInSeconds,
    endInSeconds,
    TimeInSeconds.ACCOUNTING_PERIOD,
  );

  const amountPerAccountingPeriod = calculateBatchAmountPerAccountingPeriod(totalAmount, numberOfAccountingPeriods);

  const predecessorsByStartedAt = groupBatchesByStartedAt(predecessors);
  const accountingPeriods: AccountingPeriod[] = [];

  for (let i = 0; i < numberOfAccountingPeriods; i++) {
    const accountingPeriodStartedAt = calculateProductionStartDate(
      alignedStartInSeconds,
      TimeInSeconds.ACCOUNTING_PERIOD,
      i,
    );

    const accountingPeriodEndedAt = calculateProductionEndDate(
      alignedStartInSeconds,
      TimeInSeconds.ACCOUNTING_PERIOD,
      i,
    );

    const startedAtConverted = convertDateToMilliseconds(accountingPeriodStartedAt);
    const accountingPeriodPredecessors = predecessorsByStartedAt.get(startedAtConverted) || [];

    accountingPeriods.push({
      startedAt: accountingPeriodStartedAt,
      endedAt: accountingPeriodEndedAt,
      amount: amountPerAccountingPeriod,
      predecessors: accountingPeriodPredecessors,
    });
  }

  return accountingPeriods;
}

function groupBatchesByStartedAt(processSteps: ProcessStepEntity[]): Map<number, BatchEntity[]> {
  const batchesByStartedAt = new Map<number, BatchEntity[]>();

  for (const processStep of processSteps) {
    const startedAt = convertDateToMilliseconds(processStep.startedAt);

    const batches = batchesByStartedAt.get(startedAt) || [];
    batches.push(processStep.batch);
    batchesByStartedAt.set(startedAt, batches);
  }

  return batchesByStartedAt;
}

  /**
   * Takes a total value (e.g., hydrogen production or water consumption) and calculates the proportionate value based on total and proportionate power production.
   * @param totalAmount The total amount to be prorated.
   * @param totalPowerConsumption The total amount of electricity to be used as a reference.
   * @param partialPowerConsumption The partial amount of electricity to be used as a reference.
   * @returns The partial amount.
   */
export function calculatePartialAmountRelativeToPowerProduction(
  totalAmount: number,
  totalPowerConsumption: number,
  partialPowerConsumption: number,
) {
  if (totalAmount <= 0 || totalPowerConsumption <= 0) {
    throw new Error(`The partial amount could not be calculated because at least one total is 0.`);
  }
  const shareOfPartialPowerFromTotalPower: number = (partialPowerConsumption * 100) / totalPowerConsumption;
  return (totalAmount / 100) * shareOfPartialPowerFromTotalPower;
}

  /**
   * If the PowerProduction is grid electricity, then the CreateProductionsPayload should be split into two parts so that both a HydrogenBatch from renewable electricity and one from non-renewable electricity can be created.
   * @param createProductionsPayload The production payload, which may need to be split up.
   * @param powerProductionUnitEnergyType The energy type of the power production unit to be tested on grid electricity.
   * @returns In the Grid Electricity case, a list of the productions to be created for the two electricity options is returned. In the case of renewable electricity, nothing is done and the original payload is returned.
   */
export function splitGridPowerProduction(
  createProduction: CreateProductionEntity,
  powerProductionUnitEnergySource: EnergySource,
): CreateProductionEntity[] {
  if (powerProductionUnitEnergySource != EnergySource.GRID) {
    return [createProduction];
  }

  const renewablePowerAmountKwh = (createProduction.powerAmountKwh * RenewableShareInGridMix.DE) / 100;
  const renewableHydrogenAmountKg = (createProduction.hydrogenAmountKg * RenewableShareInGridMix.DE) / 100;
  const renewableWaterConsumption = (createProduction.waterConsumptionLitersPerHour * RenewableShareInGridMix.DE) / 100;

  const notRenewablePowerAmountKwh = createProduction.powerAmountKwh - renewablePowerAmountKwh;
  const notRenewableHydrogenAmountKg = createProduction.hydrogenAmountKg - renewableHydrogenAmountKg;
  const notRenewableWaterConsumption = createProduction.waterConsumptionLitersPerHour - renewableWaterConsumption;

  return [
    createEntityForNewAmounts(
      createProduction,
      renewableHydrogenAmountKg,
      renewablePowerAmountKwh,
      renewableWaterConsumption,
      PowerType.PARTLY_RENEWABLE,
    ),
    createEntityForNewAmounts(
      createProduction,
      notRenewableHydrogenAmountKg,
      notRenewablePowerAmountKwh,
      notRenewableWaterConsumption,
      PowerType.NON_RENEWABLE,
    ),
  ];
}

function createEntityForNewAmounts(
  createProductionEntity: CreateProductionEntity,
  hydrogenAmount: number,
  powerAmount: number,
  waterConsumption: number,
  powerType: PowerType,
): CreateProductionEntity {
  return new CreateProductionEntity(
    createProductionEntity.productionStartedAt,
    createProductionEntity.productionEndedAt,
    createProductionEntity.powerProductionUnitId,
    powerType,
    powerAmount,
    createProductionEntity.hydrogenProductionUnitId,
    hydrogenAmount,
    createProductionEntity.recordedBy,
    createProductionEntity.hydrogenStorageUnitId,
    createProductionEntity.ownerIdOfPowerProductionUnit,
    createProductionEntity.ownerIdOfHydrogenProductionUnit,
    waterConsumption,
  );
}
